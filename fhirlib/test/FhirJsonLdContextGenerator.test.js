const Fs = require('fs');
const Path = require('path');
const Jsonld  = require('jsonld');
const FhirJsonLdContextGenerator = require('../FhirJsonLdContextGenerator.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');
const ShExUtil = require("@shexjs/util");

const GEN_JSONLD_CONTEXT_CONFIG = {
};

const Generatod = {}; // all generated contexts by URL
// let Expected = null;

/*
const MonitorFile = "monitor.txt";
const MonitorStream = Fs.createWriteStream(MonitorFile);
MonitorStream.on('error', () => {throw Error(`Failure to write to ${MonitorFile}`)})
MonitorStream.write(`${__esModule}\n\n`);
afterAll(() => {MonitorStream.close()});
*/

const ShExJ = JSON.parse(Fs.readFileSync(Path.join(__dirname, '../fhir.shexj'), 'utf8'));
const Index = ShExUtil.index(ShExJ);

Jsonld.documentLoader = function(url) {
  if (url.startsWith(FhirJsonLdContextGenerator.STEM) && url.endsWith(FhirJsonLdContextGenerator.SUFFIX)) {
    const genMe = url.substr(FhirJsonLdContextGenerator.STEM.length, url.length - FhirJsonLdContextGenerator.STEM.length - FhirJsonLdContextGenerator.SUFFIX.length);
    const generator = new FhirJsonLdContextGenerator(ShExJ, Index);
    const context = generator.genJsonldContext(genMe, GEN_JSONLD_CONTEXT_CONFIG);
    const ret = {
      contextUrl: null,
      documentUrl: url,
      document: JSON.stringify(context, null, 2)
    };
    Generatod[url] = context;
/*
    try {
      expect(Expected[url]).toEqual(context);
    } catch (e) {
      console.warn(e);
    }
*/
    return Promise.resolve(ret);
  }
  throw new Error("HERE");
  // return xhrDocumentLoader(url);
};

const compareMe = [
  'playground-Patient',
  'playground-Observation',
/*
  'playground-CodeSystem',
  'playground-Medication',
  'playground-AllergyIntollerance',
  'playground-Bundle',
*/
];

describe("FhirJsonLdConctextGenerator", () => {
  test.each(compareMe)('nquads(%s)', async (filename) => {
    const instanceFile = Path.join(__dirname, `json/${filename}.json`);
    const referenceContexts = Path.join(__dirname, `json/${filename}-contexts.json`);

    const json = await Fs.promises.readFile(instanceFile, 'utf8');
    const patient = JSON.parse(json);
    const preprocessor = new FhirPreprocessors.FhirR4Preprocessor();
    const preProcessed = JSON.parse(preprocessor.preprocess(patient));
    // Expected = JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8'));
    const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});

    // test against (or generate, if first time this compareMe has been run) expected contexts.
    if (Fs.existsSync(referenceContexts)) {
      // test the expected contexts
      expect(Generatod).toEqual(JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8')));
    } else {
      // still generating them. ideally should happen once per test addition
      Fs.writeFileSync(referenceContexts, JSON.stringify(Generatod, null, 2));
    }
    Generatod.length = 0;

    const expected = await Fs.promises.readFile(`./test/ttl/${filename}.nt`, 'utf8');
    // Crappy test ignores graph isomorphism, but good enough for now.
    expect(nquads).toEqual(expected);
  });
});
