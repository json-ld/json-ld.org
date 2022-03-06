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

  constructor(definitionLoader) {
    this.definitionLoader = definitionLoader;
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
    super(`Error in ${resourceDef.id} differential.element[${ordinal}] ${elt.id}: ${msg}`);
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
  static NS_s2j = "http://shex2json.example/map#"

  static fhirScalarTypeToXsd = { // overrides by trimmedTypeCode
    "Boolean": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "boolean" },
    "String": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "string" },
    "Date": { "type": "ShapeOr", "shapeExprs": [
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'date'       },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'gYearMonth' },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'gYear'      },
    ], "annotations": FhirRdfModelGenerator.unTyped() },
    "Decimal": { "type": "ShapeOr", "shapeExprs": [
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'decimal'    },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'double'     },
    ], "annotations": FhirRdfModelGenerator.unTyped() },
    "Integer": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "integer" },
    "Time": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "time" },
    "Instant": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "dateTime" },
    "DateTime": { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + "dateTime" },
  };

  static pathOverrides = { // overrides by elt.id
    'uri.value': {predicate: 'value', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'anyURI' }}, // FHIR type String
    'base64Binary.value': {predicate: 'value', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'base64Binary' }}, // also type String
    'instant.value': {predicate: 'value', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'dateTime' }}, // Datetime
    'dateTime.value': {predicate: 'value', nodeConstraint: { "type": "ShapeOr", "shapeExprs": [
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'dateTime'   },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'date'       },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'gYearMonth' },
      { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'gYear'      },
    ], "annotations": FhirRdfModelGenerator.unTyped() } }, // Datetime
    'integer64.value': {predicate: 'value', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'long' }}, // Datetime
    'Narrative.div': {predicate: 'Narrative.div', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'string' }}, // XHTML narrative text
//    'positiveInt.value': {predicate: '@@', nodeConstraint: { "type": "NodeConstraint", "datatype": FhirRdfModelGenerator.NS_xsd + 'positiveInt' }} // this doesn't work because the value was already defined by `"baseDefinition": ".../integer"`
  };

  static NestedStructureTypeCodes = ["BackboneElement", "BackboneType", "Element"];

  static FhirTypeExtension = "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type";

  constructor (definitionLoader, opts = {}) {
    this.definitionLoader = definitionLoader;
    this.stack = [];
    this.opts = opts;
  }

  myError (error) {
    if ('error' in this.opts) {
      this.opts.error(error);
    } else {
      throw error;
    }
  }

  /**
   * Recursive function to generate a content model for a FHIR Resource
   */
  visitResource (resourceDef, visitor, config) {
    this.visitElement(resourceDef, visitor, config);
    this.stack.reverse().forEach(n => visitor.exit(n));
    this.stack = [];
  }

  visitElementByName (target, visitor, config) {
    const resourceDef = this.definitionLoader.getStructureDefinitionByName(target);
    if (resourceDef === null) {
      return [];
    }

    return this.visitElement(resourceDef, visitor, config);
  }

  visitElement (resourceDef, visitor, config) {
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT))) {
      this.myError(new FhirResourceDefinitionError(`Don't know where to look for base structure ${resourceDef.baseDefinition}`, resourceDef));
      return [];
    }

    let baseElts = [];
    if ("baseDefinition" in resourceDef) {
      const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
      if (recursionTarget !== 'base')
        baseElts = this.visitElementByName(recursionTarget, visitor, config); // Get content model from base type
    }

    // Walk differential elements
    return resourceDef.differential.element.slice(1).reduce((visitedElts, elt) => {
      if (elt.id !== elt.path) { // test assumptions
        this.myError(new FhirElementDefinitionError(`id !== path in ${resourceDef.id} ${elt.id}`, resourceDef, elt));
        return visitedElts;
      }

      // Early return for the first entry in a Resource's elements
      if (!(("type" in elt) ^ ("contentReference" in elt))) { // 1st elt points to itself or something like that. Anyways, it doesn't have a type.
        this.myError(new FhirElementDefinitionError(`expected one of (type, contentReference)`, resourceDef, elt));
        return visitedElts;
      }

      // Calculate path components
      const path = elt.id.split('.');
      const resourceName = path.shift();
      if (resourceName !== resourceDef.id)
        console.warn(`property id ${elt.id} does not start with target \"${resourceDef.id}\" in ${resourceDef.id} structure def`);
      let rawName = path.pop();

      // Handle curried datatype names
      if ("type" in elt && rawName.endsWith("[x]") ^ elt.type.length > 1) { // assume "...[x]" only applies if you have multiple types
        this.myError(new Error(`Not sure whether ${resourceDef.id}.${elt.id} is a curried property or not: '${JSON.stringify(typeEntry)}'`));
        return visitedElts;
      }
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
                  || typeof typeEntry.code !== "string") {
                this.myError(new FhirElementDefinitionError(`${idx}th type entry not recognized '${JSON.stringify(typeEntry)}' in ${JSON.stringify(elt.id)}`, resourceDef, elt));
                return visitedElts;
              }

              // Calculate final element name.
              const typeCode = typeEntry.code;
              const curriedName = curried
                    ? name + typeCode.substr(0, 1).toUpperCase() + typeCode.substr(1)
                    : name;

              // Elements and BackboneElements indicate a nested structure.
              const predicate = FhirRdfModelGenerator.NS_fhir + // elt.id
                    [resourceName].concat(path).concat(curriedName).join('.');
              if (FhirRdfModelGenerator.NestedStructureTypeCodes.indexOf(typeCode) !== -1) {
                if (elt.type.length > 1) {
                  this.myError(new FhirElementDefinitionError(`expected exactly one type for nested structure '${elt.id}'`, resourceDef));
                }

                // Construct a Nesting for this property and visitor.enter it.
                const n = new PropertyMapping(false, elt, curriedName, predicate, FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT + typeCode, null, []);
                this.stack.push(n);
                visitor.enter(n);

                // if this element extends another, process the base.
                // This is probably always true BackboneElements extend DomainResource and Elements extend BackboneType or Datatype.
                if (elt.id === resourceDef.id) {
                  this.myError(new FhirElementDefinitionError(`Resource root element should not have a type and so shouldn't get here. got type '${elt.type}'`, resourceDef, elt));
                }
                const nestedTarget = typeCode;

                // Because the nested element has a different name, we will appear to have exited any nested elements,
                // so save and hide the stack.
                const saveStack = this.stack;
                this.stack = [];
                this.visitElementByName(nestedTarget, visitor, config);
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
                  if (elt.type.length > 1) {
                    this.myError(new FhirElementDefinitionError(`expected exactly one type for scalar '${elt.id}'`, resourceDef, elt));
                  }

                  // Calculate XML Schema datatype
                  const nodeConstraint = (propertyOverride ? propertyOverride.nodeConstraint : null)
                        || (FhirRdfModelGenerator.fhirScalarTypeToXsd[trimmedTypeCode]
                            || (function () {
                              const e = new FhirElementDefinitionError(`unknown mapping to XSD for target: ${resourceDef.id}, id: ${elt.id}, code: ${trimmedTypeCode}`, resourceDef, elt);
                              console.warn(e.stack);
                              return `UNKNOWN-${resourceDef.id}-${elt.id}-${trimmedTypeCode}`;
                            })());
                  const finalName = propertyOverride ? propertyOverride.predicate : curriedName
                  const predicate2 = FhirRdfModelGenerator.NS_fhir + finalName;
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
      this.myError(FhirElementDefinitionError(`Expected ${elt.id} ${typeEntry.code} to have an <${FhirRdfModelGenerator.FhirTypeExtension}> extension`, resourceDef, elt));
      return 'UNKNOWN_FHIR_TYPE';
    }
    return ft.valueUrl || ft.valueUri; // latter is deprecated?
  }

  static unTyped (property) {
    return [ {
      "type": "Annotation",
      "predicate": FhirRdfModelGenerator.NS_s2j + "property",
      "object": FhirRdfModelGenerator.NS_s2j + "unTyped"
    } ];
  }

  /*
  static propAnnot (property) {
    return [ {
      "type": "Annotation",
      "predicate": FhirRdfModelGenerator.NS_s2j + "property",
      "object": { "value": property }
    } ];
  }
  */
}

if (typeof module !== 'undefined')
  module.exports = {FhirRdfModelGenerator, FhirResourceDefinitionError, FhirElementDefinitionError, ModelVisitor, PropertyMapping};
