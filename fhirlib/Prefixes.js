Prefixes = {
  'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  'fhir': 'http://hl7.org/fhir/',
  'shex': 'http://www.w3.org/ns/shex#',
  'xsd': 'http://www.w3.org/2001/XMLSchema#',
  'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
  'owl': 'http://www.w3.org/2002/07/owl#',
  'fhirshex': 'http://hl7.org/fhir/shape/',
  'fhirvs': 'http://hl7.org/fhir/ValueSet/',
/* not needed yet
  'dc': 'http://purl.org/dc/elements/1.1/',
  'cs': 'http://hl7.org/orim/codesystem/',
  'dc': 'http://purl.org/dc/elements/1.1/',
  'dcterms': 'http://purl.org/dc/terms/',
  'dt': 'http://hl7.org/orim/datatype/',
  'ex': 'http://hl7.org/fhir/StructureDefinition/',
  'fhir-vs': 'http://hl7.org/fhir/ValueSet/',
  'loinc': 'http://loinc.org/rdf#',
  'os': 'http://open-services.net/ns/core#',
  'rim': 'http://hl7.org/orim/class/', // oops
  'rim': 'http://hl7.org/owl/rim/',
  'sct': 'http://snomed.info/id/',
  'vs': 'http://hl7.org/orim/valueset/',
  'w5': 'http://hl7.org/fhir/w5#'
*/
};

if (typeof module !== 'undefined')
  module.exports = Prefixes;
