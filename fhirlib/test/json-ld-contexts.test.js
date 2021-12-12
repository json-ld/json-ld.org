const Fs = require('fs');
const Jsonld  = require('jsonld');
const FhirJsonLdContextGenerator = require('../FhirJsonLdContextGenerator.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');
const R5StructureDefintions = require('../../playground/R5-StructureDefinitions-no-ws.js');
const R5Datatypes = require('../../playground/R5-Datatypes-no-ws.js');

const GEND_CONTEXT_STEM = "https://fhircat.org/fhir-r4/original/contexts/";
const GEND_CONTEXT_SUFFIX = ".context.jsonld";
const GEN_JSONLD_CONTEXT_CONFIG = {
};

const indexFhir = (acc, entry) => {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};
const FHIRStructureMap = R5StructureDefintions.entry.reduce(indexFhir, {});
const FHIRDatatypeMap = R5Datatypes.entry.reduce(indexFhir, {});


Jsonld.documentLoader = function(url) {
  if (url.startsWith(GEND_CONTEXT_STEM) && url.endsWith(GEND_CONTEXT_SUFFIX)) {
    try {
      const genMe = url.substr(GEND_CONTEXT_STEM.length, url.length - GEND_CONTEXT_STEM.length - GEND_CONTEXT_SUFFIX.length);
      const generator = new FhirJsonLdContextGenerator(FHIRStructureMap, FHIRDatatypeMap);
      const context = generator.genJsonldContext(genMe, GEN_JSONLD_CONTEXT_CONFIG);
      const ret = {
        contextUrl: null,
        documentUrl: url,
        document: JSON.stringify(context, null, 2)
      };
      return Promise.resolve(ret);
    } catch (e) {
      console.warn("error trying to genJsonldContext:" + e.stack);
      throw e; // not that anyone appears to care
    }
  }
  throw new Error("HERE");
  // return xhrDocumentLoader(url);
};

const compareMe = [
  'playground-Patient',
/*
  'playground-Observation',
  'playground-CodeSystem',
  'playground-Medication',
  'playground-AllergyIntollerance',
  'playground-Bundle',
*/
];

test.each(compareMe)('nquads(%s)', async (filename) => {
  // const filename = 'playground-Patient';
  const json = await Fs.promises.readFile(`./test/json/${filename}.json`, 'utf8');
  const patient = JSON.parse(json);
  const preprocessor = new FhirPreprocessors.FhirR4Preprocessor();
  const preProcessed = JSON.parse(preprocessor.preprocess(patient));
  const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});
  const expected = await Fs.promises.readFile(`./test/ttl/${filename}.ttl`, 'utf8');
  // Crappy test ignores graph isomorphism, but good enough for now.
  expect(nquads).toEqual(expected);
});
