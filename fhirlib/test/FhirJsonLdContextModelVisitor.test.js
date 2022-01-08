const Fs = require('fs');
const Jsonld  = require('jsonld');
const FhirJsonLdContextModelVisitor = require('../FhirJsonLdContextModelVisitor.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');
const R5Resources = require('../../playground/R5-Resources-no-ws.js');
const R5Datatypes = require('../../playground/R5-Datatypes-no-ws.js');

const GEN_JSONLD_CONTEXT_CONFIG = {
};

Jsonld.documentLoader = function(url) {
  if (url.startsWith(FhirJsonLdContextModelVisitor.STEM) && url.endsWith(FhirJsonLdContextModelVisitor.SUFFIX)) {
    const genMe = url.substr(FhirJsonLdContextModelVisitor.STEM.length, url.length - FhirJsonLdContextModelVisitor.STEM.length - FhirJsonLdContextModelVisitor.SUFFIX.length);
    const generator = new FhirJsonLdContextModelVisitor(R5Resources, R5Datatypes);
    const context = generator.genJsonldContext(genMe, GEN_JSONLD_CONTEXT_CONFIG);
    const ret = {
      contextUrl: null,
      documentUrl: url,
      document: JSON.stringify(context, null, 2)
    };
    return Promise.resolve(ret);
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
  const expected = await Fs.promises.readFile(`./test/ttl/${filename}.nt`, 'utf8');
  // Crappy test ignores graph isomorphism, but good enough for now.
  expect(nquads).toEqual(expected);
});
