const Fs = require('fs');
const Jsonld  = require('jsonld');
const GenJsonLdContext = require('../genJsonldContext.js');
const FhirR4Preprocessor = require('../FhirR4Preprocessor.js');
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


Jsonld.documentLoader = function(url) {debugger
  if (url.startsWith(GEND_CONTEXT_STEM) && url.endsWith(GEND_CONTEXT_SUFFIX)) {
    try {
      const genMe = url.substr(GEND_CONTEXT_STEM.length, url.length - GEND_CONTEXT_STEM.length - GEND_CONTEXT_SUFFIX.length);
      const struc = { '@context': genJsonldContext(genMe, FHIRStructureMap, FHIRDatatypeMap, GEN_JSONLD_CONTEXT_CONFIG) };
      const ret = {
        contextUrl: null,
        documentUrl: url,
        document: JSON.stringify(struc, null, 2)
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

test('nquads(playground Patient).length > 1000', async () => {
  const json = await Fs.promises.readFile('./test/json/playground-Patient.json', 'utf8');
  const patient = JSON.parse(json);debugger;
  const preProcessed = JSON.parse(new FhirR4Preprocessor().preprocess(patient));
  // const context = patient['@context'];
  // const compacted = await Jsonld.compact(patient, context);
  // console.log(Object.keys(compacted));
  const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});
  console.log(nquads);
  expect(nquads.length).toBeGreaterThan(1000);
});

