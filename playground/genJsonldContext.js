const LOGID = "genJsonldContext: ";
const GEND_CONTEXT_SUFFIX = ".context.jsonld";
const STRUCTURE_DEFN_ROOT = "http://hl7.org/fhir/StructureDefinition/";
const FHIRPATH_ROOT = "http://hl7.org/fhirpath/System."

const HEADER = {
    "@version": 1.1,
    "@vocab": "http://example.com/UNKNOWN#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "fhir": "http://hl7.org/fhir/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "resourceType": {
      "@id": "rdf:type",
      "@type": "@id"
    },
};

const NAMESPACES = { 
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

genJsonldContext = function (target, structureMap, datatypeMap, config) {
  console.log("genJsonldContext " + target);
  let map;
  if (target === "root") {
    return NAMESPACES;
  } if (target in structureMap) {
    map = structureMap;
  } else if (target in datatypeMap) {
    map = datatypeMap;
  } else if (!(target in map)) throw new Error(`Key ${target} not found in ${Object.keys(map)}`);
  const resource = map[target];
  if ("baseDefinition" in resource && !(resource.baseDefinition.startsWith(STRUCTURE_DEFN_ROOT))) throw new Error(`Don't know where to look for base structure ${resource.baseDefinition}`);
  const ret = "baseDefinition" in resource
        ? genJsonldContext(
          resource.baseDefinition.substr(STRUCTURE_DEFN_ROOT.length).toLowerCase(),
          structureMap,
          datatypeMap,
          config
        )
        : JSON.parse(JSON.stringify(HEADER));
  if (typeof globalThis.RET === "undefined")
    globalThis.RET = ret;
  const backboneElements = {};
  let nowIn, resourceName;
  resource.differential.element.forEach(elt => {
    if (elt.id !== elt.path) throw new Error(`id !== path in ${target} ${map[target]}`);
    if (!("type" in elt)) { // 1st elt points to itself or something like that. Anyways, it doesn't have a type.
      backboneElements[''] = ret;
      return;
    }
    const path = elt.id.split('.');
    resourceName = path.shift();
    if (resourceName.toLowerCase() !== target) throw new Error(`property id ${elt.id} does not start with target \"${target}\" in ${map[target]}`);
    let rawName = path.pop();
    if (rawName.endsWith("[x]") ^ elt.type.length > 1)
      throw new Error(`Not sure whether ${target}.${elt.id} is a curried property or not: '${JSON.stringify(typeEntry)}'`);
    const [curried, name] = elt.type.length > 1
          ? [true, rawName.substr(0, rawName.length - "[x]".length)]
          : [false, rawName]; 
    if (!Array.isArray(elt.type))
      throw new Error(`unknown type list '${elt.id}' in ${JSON.stringify(map[target])}`);
    elt.type.forEach((typeEntry, idx) => {
      if (typeof typeEntry !== "object"
          || !("code" in typeEntry)
          || typeof typeEntry.code !== "string")
        throw new Error(`${idx}th type entry not recognized '${JSON.stringify(typeEntry)}' in ${JSON.stringify(map[target])}`);
      const typeCode = typeEntry.code;
      const curriedName = curried
            ? name + typeCode.substr(0, 1).toUpperCase() + typeCode.substr(1)
            : name;
      const left = path.join('.');

      if (typeCode === "BackboneElement" || typeCode === "Element") {
        const backboneEltName = [...path, curriedName].join('.');
        backboneElements[backboneEltName] = "baseDefinition" in resource // always true 'cause {,Backbone}Element have baseDefinitions.
              ? genJsonldContext(
                resource.baseDefinition.substr(STRUCTURE_DEFN_ROOT.length).toLowerCase(),
                structureMap,
                datatypeMap,
                config
              )
              : JSON.parse(JSON.stringify(HEADER)); // never gets here
        backboneElements[left][curriedName] = {
          '@id': `fhir:${elt.id}`,
          '@context': backboneElements[backboneEltName]
        };
      } else {
        const trimmedTypeCode = typeCode.startsWith(FHIRPATH_ROOT)
              ? typeCode.substr(FHIRPATH_ROOT.length)
              : typeCode
        backboneElements[left][curriedName] = {
          '@id': `fhir:${elt.id}`,
          '@context': trimmedTypeCode.toLowerCase() + GEND_CONTEXT_SUFFIX
        };
      }
    });
  });
  return ret;
}
