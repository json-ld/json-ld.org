const FhirProfileVisitor = require('./FhirProfileVisitor').FhirProfileVisitor;

class FhirJsonLdContextGenerator extends FhirProfileVisitor {
  static GEND_CONTEXT_SUFFIX = ".context.jsonld";
  static STRUCTURE_DEFN_ROOT = "http://hl7.org/fhir/StructureDefinition/";
  static FHIRPATH_ROOT = "http://hl7.org/fhirpath/System."

  static HEADER = {
    "@version": 1.1,
    "@vocab": "http://example.com/UNKNOWN#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "fhir": "http://hl7.org/fhir/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "resourceType": {
      "@id": "rdf:type",
      "@type": "@id"
    },
    "index": {
      "@id": "fhir:index",
      "@type": "http://www.w3.org/2001/XMLSchema#integer"
    },
  };

  static NAMESPACES = {
    "fhir": "http://hl7.org/fhir/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "dc": "http://purl.org/dc/elements/1.1/",
    "cs": "http://hl7.org/orim/codesystem/",
    "dc": "http://purl.org/dc/elements/1.1/",
    "dcterms": "http://purl.org/dc/terms/",
    "dt": "http://hl7.org/orim/datatype/",
    "ex": "http://hl7.org/fhir/StructureDefinition/",
    "fhir-vs": "http://hl7.org/fhir/ValueSet/",
    "loinc": "http://loinc.org/rdf#",
    "os": "http://open-services.net/ns/core#",
    "rim": "http://hl7.org/orim/class/",
    "rim": "http://hl7.org/owl/rim/",
    "sct": "http://snomed.info/id/",
    "vs": "http://hl7.org/orim/valueset/",
    "w5": "http://hl7.org/fhir/w5#"
  };

  constructor(structureMap, datatypeMap) {
    super(structureMap, datatypeMap);
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
    this.cache = new Map(); // not used yet
  }

  genJsonldContext (target, config) {
    const ret = this.walk(target, config);
    return ret;
  }

  /**
   * Recursive function to generate a content model for a FHIR Resource
   */
  walk (target, config) {
    let map;
    if (target === "root") {
      return FhirJsonLdContextGenerator.NAMESPACES;
    } if (target in this.structureMap) {
      map = this.structureMap;
    } else if (target in this.datatypeMap) {
      map = this.datatypeMap;
    } else if (!(target in map)) throw new Error(`Key ${target} not found in ${Object.keys(map)}`);

    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirJsonLdContextGenerator.STRUCTURE_DEFN_ROOT)))
      throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);

    const ret = "baseDefinition" in resourceDef
          ? this.walk( // Get content model from base type
            resourceDef.baseDefinition.substr(FhirJsonLdContextGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase(),
            config
          )
          : JSON.parse(JSON.stringify(FhirJsonLdContextGenerator.HEADER));
    const elementHierarchy = {
      '': ret
    };
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
          const backboneEltName = [...path, curriedName].join('.');
          elementHierarchy[backboneEltName] = "baseDefinition" in resourceDef  // apparently always true because
            ? this.walk(                                         // {,Backbone}Element have baseDefinitions.
              resourceDef.baseDefinition.substr(FhirJsonLdContextGenerator.STRUCTURE_DEFN_ROOT.length).toLowerCase(),
              config
            )
            : JSON.parse(JSON.stringify(FhirJsonLdContextGenerator.HEADER));                       // so it never gets here
          elementHierarchy[left][curriedName] = {
            '@id': `fhir:${elt.id}`,
            '@context': elementHierarchy[backboneEltName]
          };
        } else {
          // Create a new property entry with the appropriate @context reference
          const trimmedTypeCode = typeCode === "code"
                ? "String"
                : typeCode.startsWith(FhirJsonLdContextGenerator.FHIRPATH_ROOT)
                ? typeCode.substr(FhirJsonLdContextGenerator.FHIRPATH_ROOT.length)
                : typeCode
          const isValue = elt.id === trimmedTypeCode.toLocaleLowerCase() + ".value"
                || ["base64Binary.value", "uri.value", "instant.value"].indexOf(elt.id) !== -1;
          const propertyName = isValue
          // || trimmedTypeCode === "code"
                ? "value"
                : elt.id;
          // if (typeCode.startsWith(FhirJsonLdContextGenerator.FHIRPATH_ROOT)) debugger;
          // if (elt.id.endsWith(".value"/* && trimmedTypeCode === "String"*/)) {debugger;
          //   console.log("HERE", elt.id, trimmedTypeCode, "value");}
          elementHierarchy[left][curriedName] = {
            '@id': `fhir:${propertyName}`,
            '@context': trimmedTypeCode.toLowerCase() + FhirJsonLdContextGenerator.GEND_CONTEXT_SUFFIX
          };
          if (isValue) {
            const xsdNs = "http://www.w3.org/2001/XMLSchema#";
            const fhirPathTypeToXsd = {
              "Boolean": "boolean",
              "String": "string",
              "Date": "date",
              "Decimal": "decimal",
              "Integer": "integer",
              "Time": "time",
              "Instant": "dateTime",
              "DateTime": "dateTime",
            };
            const dt = elt.id === "uri.value" // type String
                  ? "anyURI"
                  : elt.id === "base64Binary.value" // also type String
                  ? "base64Binary"
                  : (fhirPathTypeToXsd[trimmedTypeCode]
                     || (function () {
                       const e = new Error(`unknown mapping to XSD for target: ${target}, id: ${elt.id}, code: ${trimmedTypeCode}`);
                       console.warn(e.stack);
                       return `UNKNOWN-${target}-${elt.id}-${trimmedTypeCode}`;
                     })());
            delete elementHierarchy[left][curriedName]['@context'];
            elementHierarchy[left][curriedName]['@type'] = xsdNs + dt;
          }
        }
      });
    });

    // Return the constructed @context.
    // if (typeof globalThis.CONTEXTS === "undefined")
    //   globalThis.CONTEXTS = ret;
    // globalThis.CONTEXTS[target] = JSON.parse(JSON.stringify(ret));
    // console.log(target, ret);
    // if (typeof globalThis.CONTEXTS === "undefined")
    //   globalThis.CONTEXTS = {};
    // globalThis.CONTEXTS[target] = {};
    return ret;
  }
};

if (typeof module !== 'undefined')
  module.exports = FhirJsonLdContextGenerator;
