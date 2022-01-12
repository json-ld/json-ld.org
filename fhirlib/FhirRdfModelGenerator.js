const { indexBundle } = require('./indexBundle');

/**
 * Used in the visitor API to communicate JSON properties definitions mapped to RDF.
 */
class PropertyMapping {
  constructor(isScalar, element, property, predicate, type, binding) {
    this.isScalar = isScalar;
    this.element = element;
    this.property = property;
    this.predicate = predicate;
    this.type = type;
    this.binding = binding;
  }
}

class ModelVisitor {
  static empty = { entry: [] }; // dummy to not cause trouble

  constructor(resources = ModelVisitor.empty, datatypes = ModelVisitor.empty, valuesets = ModelVisitor.empty) {
    this.resources = indexBundle(resources);
    this.datatypes = indexBundle(datatypes);
    this.valuesets = indexBundle(valuesets);
    this.codesystems = valuesets.entry.reduce((codesystems, entry) => {
      const resource = entry.resource;
      if (resource.resourceType === "CodeSystem") {
        codesystems.set(resource.url, resource);
      }
      return codesystems;
    }, new Map())
  }
  enter (propertyMapping) { throw new Error(`ModelVistor.enter(${propertyMapping}) must be overloaded`); }
  element (propertyMapping) { throw new Error(`ModelVistor.complex(${propertyMapping}) must be overloaded`); }
  exit (propertyMapping) { throw new Error(`ModelVistor.exit(${propertyMapping}) must be overloaded`); }
}

/**
 * Walk a FHIR Resource definition and call a visitor for each scalar or complex element property definition when entering or exiting a nested Element.
 */
class FhirRdfModelGenerator {
  static STRUCTURE_DEFN_ROOT = "http://hl7.org/fhir/StructureDefinition/";
  static FHIRPATH_ROOT = "http://hl7.org/fhirpath/System.";
  static NS_fhir = "http://hl7.org/fhir/";
  static NS_xsd = "http://www.w3.org/2001/XMLSchema#";

  static fhirScalarTypeToXsd = {
    "Boolean": "boolean",
    "String": "string",
    "Date": "date",
    "Decimal": "decimal",
    "Integer": "integer",
    "Time": "time",
    "Instant": "dateTime",
    "DateTime": "dateTime",
  };

  static pathOverrides = {
    'uri.value': {predicate: 'value', datatype: 'anyURI'}, // FHIR type String
    'base64Binary.value': {predicate: 'value', datatype: 'base64Binary'}, // also type String
    'instant.value': {predicate: 'value', datetype: 'dateTime'}, // Datetime
    'Narrative.div': {predicate: 'Narrative.div', datatype: 'string'}, // XHTML narrative text
//    'positiveInt.value': {datatype: 'positiveInt'} // this doesn't work because the value was already defined by `"baseDefinition": ".../integer"`
  };

  static NestedStructureTypeCodes = ["BackboneElement", "Element"];

  static FhirTypeExtension = "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type";

  constructor (resources, datatypes, valuesets) {
    this.resources = resources;
    this.datatypes = datatypes;
    this.valuesets = valuesets;
    this.stack = [];
  }

  /**
   * Recursive function to generate a content model for a FHIR Resource
   */
  visitResource (target, visitor, config) {
    this.visitElement(target, visitor, config);
    this.stack.reverse().forEach(n => visitor.exit(n));
    this.stack = [];
  }

  visitElement (target, visitor, config) {
    let map;
    if (target === "root") {
      return;
    } if (target in this.resources._index) {
      map = this.resources._index;
    } else if (target in this.datatypes._index) {
      map = this.datatypes._index;
    } else {
      throw new Error(`Key ${target} not found in ${Object.keys(this.resources._index)} or ${Object.keys(this.datatypes._index)}`);
    }

    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);

    let baseElts = [];
    if ("baseDefinition" in resourceDef) {
      const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
      if (recursionTarget !== 'base')
        baseElts = this.visitElement(recursionTarget, visitor, config); // Get content model from base type
    }

    // Walk differential elements
    return resourceDef.differential.element.reduce((visitedElts, elt) => {
      if (elt.id !== elt.path) // test assumptions
        throw new Error(`id !== path in ${target} ${map[target]}`);

      // Early return for the first entry in a Resource's elements
      if (!("type" in elt)) { // 1st elt points to itself or something like that. Anyways, it doesn't have a type.
        return visitedElts; // should be []
      }

      // Calculate path components
      const path = elt.id.split('.');
      const resourceName = path.shift();
      if (resourceName !== target)
        throw new Error(`property id ${elt.id} does not start with target \"${target}\" in ${map[target]}`);
      let rawName = path.pop();

      // Handle curried datatype names
      if (rawName.endsWith("[x]") ^ elt.type.length > 1)
        throw new Error(`Not sure whether ${target}.${elt.id} is a curried property or not: '${JSON.stringify(typeEntry)}'`);
      const [curried, name] = elt.type.length > 1
          ? [true, rawName.substr(0, rawName.length - "[x]".length)]
          : [false, rawName];

      if (!Array.isArray(elt.type)) // test assumptions
        throw new Error(`unknown type list '${elt.id}' in ${JSON.stringify(map[target])}`);

      // Trim down any nested properties we've passed as evidenced by them not having a corresponding name in the path.
      for (let i = 0; i < this.stack.length; ++i) {
        if (this.stack[i].element.id.split('.').slice(1)[0] !== path[i]) {
          // `i` has the index of the first Nesting not consistent with `path`.
          this.stack.slice(i).reverse().forEach(n => visitor.exit(n)); // call exit on each extra element in the stack
          this.stack = this.stack.slice(0, i); // trim down the stack
          break;
        }
      }

      if (!('type' in elt || elt.type.length === 0))
        throw new Error(`expected one or more types in '${elt.id}'`); // DEBUG: add ${JSON.stringify(elt)}

      // aggregate element's types into a disjunction
      const disjointPMaps = elt.type.reduce((acc, typeEntry, idx) => {
        if (typeof typeEntry !== "object"
            || !("code" in typeEntry)
            || typeof typeEntry.code !== "string")
          throw new Error(`${idx}th type entry not recognized '${JSON.stringify(typeEntry)}' in ${JSON.stringify(map[target])}`);

        // Calculate final element name.
        const typeCode = typeEntry.code;
        const curriedName = curried
              ? name + typeCode.substr(0, 1).toUpperCase() + typeCode.substr(1)
              : name;

        // Elements and BackboneElements indicate a nested structure.
        const predicate = FhirRdfModelGenerator.NS_fhir + // elt.id
              [resourceName].concat(path).concat(curriedName).join('.');
        if (FhirRdfModelGenerator.NestedStructureTypeCodes.indexOf(typeCode) !== -1) {
          if (elt.type.length > 1)
            throw new Error(`expected exactly one type for nested structure '${elt.id}'`); // DEBUG: add ${JSON.stringify(elt)}

          // Construct a Nesting for this property and visitor.enter it.
          const n = new PropertyMapping(false, elt, curriedName, predicate, resourceDef.baseDefinition);
          this.stack.push(n);
          visitor.enter(n);

          // if this element extends another, process the base.
          // This is probably always true BackboneElements extend DomainResource and Elements extend BackboneType or Datatype.
          if ("baseDefinition" in resourceDef) {
            if (!resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT))
              throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);
            const nestedTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);

            // Because the nested element has a different name, we will appear to have exited any nested elements,
            // so save and hide the stack.
            const saveStack = this.stack;
            this.stack = [];
            this.visitElement(nestedTarget, visitor, config);
            this.stack = saveStack;
          }
          return [];
        } else {
          const isFhirPath = typeCode.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT);
          const trimmedTypeCode = isFhirPath
                ? typeCode.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length) // http://hl7.org/fhirpath/System.String -> String
                : typeCode;                                                   // Address -> Address, uri -> uri

          let propertyOverride = FhirRdfModelGenerator.pathOverrides[elt.id];
          const isScalar = elt.id === trimmedTypeCode.toLocaleLowerCase() + ".value" //  e.g. elt.id is "string.value", "date.value"
                || !!propertyOverride;
          const isSpecialization = baseElts.find(disjuncts => disjuncts.find(pMap => pMap.property === curriedName));
          if (isSpecialization)
            return []; // TODO: update specializations

          if (isScalar) {
            if (elt.type.length > 1)
              throw new Error(`expected exactly one type for scalar '${elt.id}'`); // DEBUG: add ${JSON.stringify(elt)}

            // Calculate XML Schema datatype
            const xsdDatatype = (propertyOverride ? propertyOverride.datatype : null)
                       || (FhirRdfModelGenerator.fhirScalarTypeToXsd[trimmedTypeCode]
                       || (function () {
                            const e = new Error(`unknown mapping to XSD for target: ${target}, id: ${elt.id}, code: ${trimmedTypeCode}`);
                            console.warn(e.stack);
                            return `UNKNOWN-${target}-${elt.id}-${trimmedTypeCode}`;
                       })());
            const finalName = propertyOverride ? propertyOverride.predicate : curriedName
            const pMap = new PropertyMapping(true, elt, curriedName, FhirRdfModelGenerator.NS_fhir + finalName, { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + xsdDatatype }, null);
            return acc.concat([pMap]);
          } else {
            const binding = 'binding' in elt ? elt.binding : null;
            const shapeLabel = isFhirPath
                ? FhirRdfModelGenerator.expectFhirType(elt, typeEntry)
                : typeCode;
            const pMap = new PropertyMapping(false, elt, curriedName, predicate, shapeLabel, binding);
            return acc.concat([pMap]);
          }
        }
      }, []);

      if (disjointPMaps.length) // will be 0 if elt.id was in NestedStructureTypeCodes, as verified by (elt.type.length > 1) assertions
        visitor.element(disjointPMaps);
      return visitedElts.concat([disjointPMaps]);
    }, []);
  }

  static expectFhirType (elt, typeEntry) {
    const ft = (typeEntry.extension || []).find(ext => ext.url === FhirRdfModelGenerator.FhirTypeExtension);
    if (!ft) {
      throw Error(`Expected ${elt.id} ${typeEntry.code} to have an <${FhirRdfModelGenerator.FhirTypeExtension}> extension`);
    }
    return ft.valueUrl || ft.valueUri; // latter is deprecated?
  }
}

if (typeof module !== 'undefined')
  module.exports = {FhirRdfModelGenerator, ModelVisitor, PropertyMapping};
