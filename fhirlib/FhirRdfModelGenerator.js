/**
 * Used in the visitor API to communicate JSON properties definitions mapped to RDF.
 */
class PropertyMapping {
  constructor(element, property, predicate, type) {
    this.element = element;
    this.property = property;
    this.predicate = predicate;
    this.type = type;
  }
}

class ModelVisitor {
  constructor(structureMap, datatypeMap) {
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
  }
  enter (propertyMapping) { throw new Error(`ModelVistor.enter(${propertyMapping}) must be overloaded`); }
  scalar (propertyMapping) { throw new Error(`ModelVistor.scalar(${propertyMapping}) must be overloaded`); }
  complex (propertyMapping) { throw new Error(`ModelVistor.complex(${propertyMapping}) must be overloaded`); }
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

  static fhirPathToXsd = {
    'uri.value': 'anyURI', // FHIR type String
    'base64Binary.value': 'base64Binary', // also type String
    'instant.value': 'dateTime', // Datetime
  };

  constructor (structureMap, datatypeMap) {
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
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
    } if (target in this.structureMap) {
      map = this.structureMap;
    } else if (target in this.datatypeMap) {
      map = this.datatypeMap;
    } else {
      throw new Error(`Key ${target} not found in ${Object.keys(this.structureMap)} or ${Object.keys(this.datatypeMap)}`);
    }

    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);

    if ("baseDefinition" in resourceDef) {
      const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase();
      this.visitElement(recursionTarget, visitor, config); // Get content model from base type
    }

    // Walk differential elements
    resourceDef.differential.element.forEach(elt => {
      if (elt.id !== elt.path) // test assumptions
        throw new Error(`id !== path in ${target} ${map[target]}`);

      // Early return for the first entry in a Resource's elements
      if (!("type" in elt)) { // 1st elt points to itself or something like that. Anyways, it doesn't have a type.
        return;
      }

      // Calculate path components
      const path = elt.id.split('.');
      const resourceName = path.shift();
      if (resourceName.toLowerCase() !== target)
        throw new Error(`property id ${elt.id} does not start with target \"${target}\" in ${map[target]}`);
      let rawName = path.pop();

      // Handle curried datatype names
      if (rawName.endsWith("[x]") ^ elt.type.length > 1)
        throw new Error(`Not sure whether ${target}.${elt.id} is a curried property or not: '${JSON.stringify(typeEntry)}'`);
      const [curried, name] = elt.type.length > 1
          ? [true, rawName.substr(0, rawName.length - "[x]".length)]
          : [false, rawName];

      if (!Array.isArray(elt.type)) // test assuptions
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

      // Walk the element's types
      elt.type.forEach((typeEntry, idx) => {
        if (typeof typeEntry !== "object" // test assumptions
            || !("code" in typeEntry)
            || typeof typeEntry.code !== "string")
          throw new Error(`${idx}th type entry not recognized '${JSON.stringify(typeEntry)}' in ${JSON.stringify(map[target])}`);

        // Calculate final element name.
        const typeCode = typeEntry.code;
        const curriedName = curried
              ? name + typeCode.substr(0, 1).toUpperCase() + typeCode.substr(1)
              : name;

        // Elements and BackboneElements indicate a nested structure.
        if (typeCode === "BackboneElement" || typeCode === "Element") {
          // Construct a Nesting for this property and visitor.enter it.
          const n = new PropertyMapping(elt, curriedName, FhirRdfModelGenerator.NS_fhir + elt.id, resourceDef.baseDefinition);
          this.stack.push(n);
          visitor.enter(n);

          // if this element extends another, process the base.
          // This is probably always true BackboneElements extend DomainResource and Elements extend BackboneType or Datatype.
          if ("baseDefinition" in resourceDef) {
            if (!resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT))
              throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);
            const nestedTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase();

            // Because the nested element has a different name, we will appear to have exited any nested elements,
            // so save and hide the stack.
            const saveStack = this.stack;
            this.stack = [];
            this.visitElement(nestedTarget, visitor, config);
            this.stack = saveStack;
          }
        } else {
          const trimmedTypeCode = typeCode === "code"
                ? "String"                                                     // "code" -> String
                : typeCode.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT)
                ? typeCode.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length) // http://hl7.org/fhirpath/System.String -> String
                : typeCode;                                                   // Address -> Address, uri -> uri

          const isScalar = elt.id === trimmedTypeCode.toLocaleLowerCase() + ".value" //  e.g. elt.id is "string.value", "date.value"
                || elt.id in FhirRdfModelGenerator.fhirPathToXsd;
          if (isScalar) {
            // Calculate XML Schema datatype
            const xsdDatatype = FhirRdfModelGenerator.fhirPathToXsd[elt.id]
                       || (FhirRdfModelGenerator.fhirScalarTypeToXsd[trimmedTypeCode]
                       || (function () {
                            const e = new Error(`unknown mapping to XSD for target: ${target}, id: ${elt.id}, code: ${trimmedTypeCode}`);
                            console.warn(e.stack);
                            return `UNKNOWN-${target}-${elt.id}-${trimmedTypeCode}`;
                          })());
            visitor.scalar(new PropertyMapping(elt, curriedName, FhirRdfModelGenerator.NS_fhir + 'value', FhirRdfModelGenerator.NS_xsd + xsdDatatype));
          } else {
            visitor.complex(new PropertyMapping(elt, curriedName, FhirRdfModelGenerator.NS_fhir + elt.id, trimmedTypeCode.toLowerCase()));
          }
        }
      });
    });
  }
}

if (typeof module !== 'undefined')
  module.exports = {FhirRdfModelGenerator, ModelVisitor, PropertyMapping};
