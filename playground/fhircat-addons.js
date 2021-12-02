globalThis.N3 = {
  Parser: require('n3/lib/N3Parser').Parser,
  Writer: require('n3/lib/N3Writer').Writer,
  Store: require('n3/lib/N3Store').Store,
};
globalThis.FHIRStructureMap = require('./R5-StructureDefinitions-no-ws').entry.reduce(indexFhir, {});
globalThis.FHIRDatatypeMap = require('./R5-Datatypes-no-ws').entry.reduce(indexFhir, {});
globalThis.FhirJsonLdContextGenerator = require('../fhirlib/FhirJsonLdContextGenerator');
const preprocs = require('../fhirlib/FhirPreprocessors');
globalThis.FhirPreprocessor = {
  R4: preprocs.FhirR4Preprocessor,
  R5: preprocs.FhirR5Preprocessor,
}

function indexFhir (acc, entry) {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};

