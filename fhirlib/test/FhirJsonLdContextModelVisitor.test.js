const Fs = require('fs');
const Path = require('path');
const Jsonld  = require('jsonld');
const FhirJsonLdContextModelVisitor = require('../FhirJsonLdContextModelVisitor.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');

const R5Resources = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../../playground/R5-Resources-no-ws.json')));
const R5Datatypes = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../../playground/R5-Datatypes-no-ws.json')));

const GEN_JSONLD_CONTEXT_CONFIG = {
};

const Generatod = {}; // all generated contexts by URL

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
    Generatod[url] = context;
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

describe('RDVch', () => {
  const axes = 'RDVch';
  test.each(compareMe)('nquads(%s)', async (filename) => {
    const instanceFile = Path.join(__dirname, `json/${filename}.json`);
    const referenceContexts = Path.join(__dirname, `json/${filename}-contexts.json`);

    const json = await Fs.promises.readFile(instanceFile, 'utf8');
    const patient = JSON.parse(json);
    const preprocessor = new FhirPreprocessors.FhirR4Preprocessor();
    const preProcessed = JSON.parse(preprocessor.preprocess(patient));
    const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});

    // test against (or generate, if first time this compareMe has been run) expected contexts.
    if (Fs.existsSync(referenceContexts)) {
      // test the expected contexts -- TODO: disabled because of version skew
      // expect(Generatod).toEqual(JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8')));
    } else {
      // still generating them. ideally should happen once per test addition
      Fs.writeFileSync(referenceContexts, JSON.stringify(Generatod, null, 2));
    }
    Generatod.length = 0;

    const expected = await Fs.promises.readFile(`./test/ttl/${filename}.${axes}.nt`, 'utf8');
    // Crappy test ignores graph isomorphism, but good enough for now.
    expect(nquads).toEqual(expected);
  });
});
