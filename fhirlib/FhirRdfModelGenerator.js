class Nesting {
  constructor(element, property, predicate, type) {
    this.element = element;
    this.property = property;
    this.predicate = predicate;
    this.type = type;
  }
}

class FhirRdfModelGenerator {
  static GEND_CONTEXT_SUFFIX = ".context.jsonld";
  static STRUCTURE_DEFN_ROOT = "http://hl7.org/fhir/StructureDefinition/";
  static FHIRPATH_ROOT = "http://hl7.org/fhirpath/System.";
  static NS_fhir = "http://hl7.org/fhir/";

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
  visitResource (target, config) {
    this.visitElement(target, config);
    this.stack.reverse().forEach(n => this.exit(n));
    this.stack = [];
  }

  visitElement (target, config) {
    let map;
    if (target === "root") {
      return;
    } if (target in this.structureMap) {
      map = this.structureMap;
    } else if (target in this.datatypeMap) {
      map = this.datatypeMap;
    } else if (!(target in map)) {
      throw new Error(`Key ${target} not found in ${Object.keys(map)}`);
    }

    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);

    if ("baseDefinition" in resourceDef) {
        this.visitElement( // Get content model from base type
          resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase(),
          config
        );
    }
    let resourceName;

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
      resourceName = path.shift();
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
          this.stack.slice(i).reverse().forEach(n => this.exit(n)); // call exit on each extra element in the stack
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
        const left = path.join('.');

        // Elements and BackboneElements imply a nested @context
        if (typeCode === "BackboneElement" || typeCode === "Element") {
          const n = new Nesting(elt, curriedName, FhirRdfModelGenerator.NS_fhir + elt.id, resourceDef.baseDefinition);
          this.stack.push(n);
          this.enter(n);
          const backboneEltName = [...path, curriedName].join('.');
          if ("baseDefinition" in resourceDef) {  // apparently always true because
            const hideStack = this.stack;
            this.stack = [];
            this.visitElement(                                         // {,Backbone}Element have baseDefinitions.
                resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase(),
                config
            )
            this.stack = hideStack;
          }
        } else {
          // Create a new property entry with the appropriate @context reference
          const trimmedTypeCode = typeCode === "code"
                ? "String"
                : typeCode.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT)
                ? typeCode.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length)
                : typeCode;
          const isValue = elt.id === trimmedTypeCode.toLocaleLowerCase() + ".value"
                || elt.id in FhirRdfModelGenerator.fhirPathToXsd;
          const propertyName = isValue
                ? "value"
                : elt.id;
          let propertyDefinition;
          if (isValue) {
            const xsdNs = "http://www.w3.org/2001/XMLSchema#";
            const dt = FhirRdfModelGenerator.fhirPathToXsd[elt.id]
                       || (FhirRdfModelGenerator.fhirScalarTypeToXsd[trimmedTypeCode]
                       || (function () {
                            const e = new Error(`unknown mapping to XSD for target: ${target}, id: ${elt.id}, code: ${trimmedTypeCode}`);
                            console.warn(e.stack);
                            return `UNKNOWN-${target}-${elt.id}-${trimmedTypeCode}`;
                          })());
            this.scalar(new Nesting(elt, curriedName, FhirRdfModelGenerator.NS_fhir + propertyName, xsdNs + dt));
          } else {
            this.complex(new Nesting(elt, curriedName, FhirRdfModelGenerator.NS_fhir + propertyName, trimmedTypeCode.toLowerCase() + FhirRdfModelGenerator.GEND_CONTEXT_SUFFIX));
          }
        }
      });
    });
  }
}

if (typeof module !== 'undefined')
  module.exports = {FhirProfileVisitor: FhirRdfModelGenerator, Nesting};
