globalThis.N3 = {
  Factory: require('n3/lib/N3DataFactory').default,
  Parser: require('n3/lib/N3Parser').default,
  Writer: require('n3/lib/N3Writer').default,
  Store: require('n3/lib/N3Store').default,
};
globalThis.ShExUtil = require('@shexjs/util');
globalThis.StructureError = require('../fhirlib/errors').StructureError;
globalThis.FhirJsonLdContextGenerator = require('../fhirlib/FhirJsonLdContextGenerator');
globalThis.BundleDefinitionLoader = require('../fhirlib/BundleDefinitionLoader').BundleDefinitionLoader;
globalThis.FhirShExJGenerator = require('../fhirlib/FhirShExJGenerator');
globalThis.FhirTurtleSerializer = require('../fhirlib/FhirTurtleSerializer');
globalThis.NestedWriter = require('../fhirlib/NestedWriter');
globalThis.P = require('../fhirlib/Prefixes');

globalThis.setImmediate = function (f) { return f(); }

const preprocs = require('../fhirlib/FhirPreprocessors');
globalThis.FhirPreprocessor = {
  R4: preprocs.FhirR4Preprocessor,
  R5: preprocs.FhirR5Preprocessor,
}
