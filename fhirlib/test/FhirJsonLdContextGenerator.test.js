const Fs = require('fs');
const Path = require('path');
const Jsonld  = require('jsonld');
const FhirJsonLdContextGenerator = require('../FhirJsonLdContextGenerator.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');
const ShExUtil = require("@shexjs/util");

const GEN_JSONLD_CONTEXT_CONFIG = {
};

/*
const MonitorFile = "monitor.txt";
const MonitorStream = Fs.createWriteStream(MonitorFile);
MonitorStream.on('error', () => {throw Error(`Failure to write to ${MonitorFile}`)})
MonitorStream.write(`${__esModule}\n\n`);
afterAll(() => {MonitorStream.close()});
*/

const ShExJ = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../fhir.shexj'), 'utf8'));
// Fs.writeFileSync(`/tmp/toy/fhir.shexj`, JSON.stringify(ShExJ, null, 2), {encoding: "utf8"});
// Fs.writeFileSync(`/tmp/toy/fhir-nested.shexj`, JSON.stringify(Nested, null, 2), {encoding: "utf8"});
const ContextGenerator = new FhirJsonLdContextGenerator(ShExJ);
let GeneratedContexts = null; // all generated contexts by URL
// let Expected = null;

Jsonld.documentLoader = function(url) {
  if (url.startsWith(FhirJsonLdContextGenerator.STEM) && url.endsWith(FhirJsonLdContextGenerator.SUFFIX)) {
    const genMe = url.substr(FhirJsonLdContextGenerator.STEM.length, url.length - FhirJsonLdContextGenerator.STEM.length - FhirJsonLdContextGenerator.SUFFIX.length);
    try {
      const context = ContextGenerator.genJsonldContext(genMe, GEN_JSONLD_CONTEXT_CONFIG);
      const ret = {
        contextUrl: null,
        documentUrl: url,
        document: JSON.stringify(context, null, 2)
      };
      GeneratedContexts[url] = context; // store in GeneratedContexts to test against expected closure of
      return Promise.resolve(ret);
    } catch (e) {
      console.error(e);
      throw e;
    }
   }
  throw new Error("HERE");
  // return xhrDocumentLoader(url);
};

const compareMe = [
  'playground-Patient',
  'playground-Observation',
  'playground-CodeSystem',
/*
  'playground-Medication',
  'playground-AllergyIntollerance',
  'playground-Bundle',
*/
];

describe("FhirJsonLdConctextGenerator", () => {
  test.each(compareMe)('nquads(%s) ', async (filename) => { // the WebStorm recipe has a space in the name
    const instanceFile = Path.join(__dirname, `json/${filename}.json`);
    const referenceContexts = Path.join(__dirname, `json/${filename}-contexts.json`);

    const json = await Fs.promises.readFile(instanceFile, 'utf8');
    const patient = JSON.parse(json);
    const preprocessor = new FhirPreprocessors.FhirR4Preprocessor();
    const preProcessed = JSON.parse(preprocessor.preprocess(patient));
    // Expected = JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8'));
    GeneratedContexts = {};
    const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});

    // test against (or generate, if first time this compareMe has been run) expected contexts.
    if (Fs.existsSync(referenceContexts)) {
      // test the expected contexts
      // Fs.writeFileSync(`/tmp/toy/${filename}-contexts.json`, JSON.stringify(GeneratedContexts, null, 2), {encoding: "utf8"});
      expect(GeneratedContexts).toEqual(JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8')));
    } else {
      // still generating them. ideally should happen once per test addition
      Fs.writeFileSync(referenceContexts, JSON.stringify(GeneratedContexts, null, 2));
    }

    const expected = await Fs.promises.readFile(`./test/ttl/${filename}.nt`, 'utf8');
    // Crappy test ignores graph isomorphism, but good enough for now.
    expect(nquads).toEqual(expected);
  });
});
