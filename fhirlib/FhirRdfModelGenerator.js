const { indexBundle } = require('./indexBundle');
const { StructureError } = require('./errors');

/**
 * Used in the visitor API to communicate JSON properties definitions mapped to RDF.
 */
class PropertyMapping {
  constructor(isScalar, element, property, predicate, type, binding, specializes) {
    this.isScalar = isScalar;
    this.element = element;
    this.property = property;
    this.predicate = predicate;
    this.type = type;
    this.binding = binding;
    this.specializes = specializes;
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

class FhirResourceDefinitionError extends StructureError {
  constructor (msg, resourceDef) {
    super(`Error in ${resourceDef.id}: ${msg}`);
    this.resourceDef = resourceDef;
  }

  logMessage (log) {
    log(`Bad resource`, this.resourceDef);
  }
}

class FhirElementDefinitionError extends StructureError {
  constructor (msg, resourceDef, elt) {
    const ordinal = resourceDef.differential.element.indexOf(elt);
    super(`Error in ${resourceDef.id} differential.element[${ordinal}]] ${elt.id}: ${msg}`);
    this.resourceDef = resourceDef;
    this.elt = elt;
    this.ordinal = ordinal;
  }

  logMessage (log) {
    log(`Bad element in resource differential.element[${this.ordinal}]`, this.resourceDef);
  }
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
    'instant.value': {predicate: 'value', datatype: 'dateTime'}, // Datetime
    'dateTime.value': {predicate: 'value', datatype: 'dateTime'}, // Datetime
    'integer64.value': {predicate: 'value', datatype: 'long'}, // Datetime
    'Narrative.div': {predicate: 'Narrative.div', datatype: 'string'}, // XHTML narrative text
//    'positiveInt.value': {datatype: 'positiveInt'} // this doesn't work because the value was already defined by `"baseDefinition": ".../integer"`
  };

  static NestedStructureTypeCodes = ["BackboneElement", "BackboneType", "Element"];

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
      throw new FhirResourceDefinitionError(`Key ${target} not found in ${Object.keys(this.resources._index)} or ${Object.keys(this.datatypes._index)}`, resourceDef);
    }

    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw new FhirResourceDefinitionError(`Don't know where to look for base structure ${resourceDef.baseDefinition}`, resourceDef);

    let baseElts = [];
    if ("baseDefinition" in resourceDef) {
      const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
      if (recursionTarget !== 'base')
        baseElts = this.visitElement(recursionTarget, visitor, config); // Get content model from base type
    }

    // Walk differential elements
    return resourceDef.differential.element.slice(1).reduce((visitedElts, elt) => {
      if (elt.id !== elt.path) // test assumptions
        throw new FhirElementDefinitionError(`id !== path in ${target} ${elt.id}`, resourceDef, elt);

      // Early return for the first entry in a Resource's elements
      if (!(("type" in elt) ^ ("contentReference" in elt))) { // 1st elt points to itself or something like that. Anyways, it doesn't have a type.
        throw new FhirElementDefinitionError(`expected one of (type, contentReference)`, resourceDef, elt);
      }

      // Calculate path components
      const path = elt.id.split('.');
      const resourceName = path.shift();
      if (resourceName !== target)
        console.warn(`property id ${elt.id} does not start with target \"${target}\" in ${resourceDef.id} structure def`);
      let rawName = path.pop();

      // Handle curried datatype names
      if ("type" in elt && rawName.endsWith("[x]") ^ elt.type.length > 1) // assume "...[x]" only applies if you have multiple types
        throw new Error(`Not sure whether ${target}.${elt.id} is a curried property or not: '${JSON.stringify(typeEntry)}'`);
      const [curried, name] = "type" in elt && elt.type.length > 1
          ? [true, rawName.substr(0, rawName.length - "[x]".length)]
          : [false, rawName];

      // Trim down any nested properties we've passed as evidenced by them not having a corresponding name in the path.
      for (let i = this.stack.length - 1; i >= 0; --i) {
        if (this.stack[i].property !== path[i]) {
          // `i` has the index of the first Nesting not consistent with `path`.
          this.stack.slice(i).reverse().forEach(n => visitor.exit(n)); // call exit on each extra element in the stack
          this.stack = this.stack.slice(0, i); // trim down the stack
          break;
        }
      }

      // aggregate element's types into a disjunction
      const disjointPMaps = "contentReference" in elt
        ? [new PropertyMapping(false, elt, name, FhirRdfModelGenerator.NS_fhir + [resourceName].concat(path).concat(name).join('.'), elt.contentReference.slice(1), null, [])]
        : elt.type.reduce((acc, typeEntry, idx) => {
        if (typeof typeEntry !== "object"
            || !("code" in typeEntry)
            || typeof typeEntry.code !== "string")
          throw new FhirElementDefinitionError(`${idx}th type entry not recognized '${JSON.stringify(typeEntry)}' in ${JSON.stringify(elt.id)}`, resourceDef, elt);

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
            throw new FhirElementDefinitionError(`expected exactly one type for nested structure '${elt.id}'`, resourceDef); // DEBUG: add ${JSON.stringify(elt)}

          // Construct a Nesting for this property and visitor.enter it.
          const n = new PropertyMapping(false, elt, curriedName, predicate, FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT + typeCode, null, []);
          this.stack.push(n);
          visitor.enter(n);

          // if this element extends another, process the base.
          // This is probably always true BackboneElements extend DomainResource and Elements extend BackboneType or Datatype.
          if (elt.id === resourceDef.id) throw FhirElementDefinitionError(`Resource root element should not have a type and so shouldn't get here. got type '${elt.type}'`, resourceDef, elt)
          const nestedTarget = typeCode;

          // Because the nested element has a different name, we will appear to have exited any nested elements,
          // so save and hide the stack.
          const saveStack = this.stack;
          this.stack = [];
          this.visitElement(nestedTarget, visitor, config);
          this.stack = saveStack;
          return [];
        } else {
          const isFhirPath = typeCode.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT);
          const trimmedTypeCode = isFhirPath
                ? typeCode.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length) // http://hl7.org/fhirpath/System.String -> String
                : typeCode;                                                   // Address -> Address, uri -> uri

          let propertyOverride = FhirRdfModelGenerator.pathOverrides[elt.id];
          const isScalar = (elt.id === resourceDef.id + ".value" && "representation" in elt && elt.representation[0] === "xmlAttr") //  e.g. elt.id is "string.value", "date.value"
                || !!propertyOverride;
          const specializes = path.length > 0
              ? []
              : baseElts.find(disjuncts => disjuncts.find(pMap => pMap.property === curriedName)) || [];

          if (isScalar) {
            if (elt.type.length > 1)
              throw new FhirElementDefinitionError(`expected exactly one type for scalar '${elt.id}'`, resourceDef, elt);

            // Calculate XML Schema datatype
            const xsdDatatype = (propertyOverride ? propertyOverride.datatype : null)
                       || (FhirRdfModelGenerator.fhirScalarTypeToXsd[trimmedTypeCode]
                       || (function () {
                         const e = new FhirElementDefinitionError(`unknown mapping to XSD for target: ${target}, id: ${elt.id}, code: ${trimmedTypeCode}`, resourceDef, elt);
                            console.warn(e.stack);
                            return `UNKNOWN-${target}-${elt.id}-${trimmedTypeCode}`;
                       })());
            const finalName = propertyOverride ? propertyOverride.predicate : curriedName
            const predicate2 = FhirRdfModelGenerator.NS_fhir + finalName;
            const nodeConstraint = { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + xsdDatatype };
            const pMap = new PropertyMapping(true, elt, curriedName, predicate2, nodeConstraint, null, specializes);
            return acc.concat([pMap]);
          } else {
            const binding = 'binding' in elt ? elt.binding : null;
            const shapeLabel = isFhirPath
                ? FhirRdfModelGenerator.expectFhirType(resourceDef, elt, typeEntry)
                : typeCode;
            const pMap = new PropertyMapping(false, elt, curriedName, predicate, shapeLabel, binding, specializes);
            return acc.concat([pMap]);
          }
        }
      }, []);

      if (disjointPMaps.length) // will be 0 if elt.id was in NestedStructureTypeCodes, as verified by (elt.type.length > 1) assertions
        visitor.element(disjointPMaps);
      return visitedElts.concat([disjointPMaps]);
    }, []);
  }

  static expectFhirType (resourceDef, elt, typeEntry) {
    const ft = (typeEntry.extension || []).find(ext => ext.url === FhirRdfModelGenerator.FhirTypeExtension);
    if (!ft) {
      throw FhirElementDefinitionError(`Expected ${elt.id} ${typeEntry.code} to have an <${FhirRdfModelGenerator.FhirTypeExtension}> extension`, resourceDef, elt);
    }
    return ft.valueUrl || ft.valueUri; // latter is deprecated?
  }
}

if (typeof module !== 'undefined')
  module.exports = {FhirRdfModelGenerator, FhirResourceDefinitionError, FhirElementDefinitionError, ModelVisitor, PropertyMapping};
