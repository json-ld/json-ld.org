const Fs = require('fs');
const Path = require('path');
const Jsonld  = require('jsonld');
const P = require('../Prefixes');
const FhirJsonLdContextGenerator = require('../FhirJsonLdContextGenerator.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');
const ShExUtil = require("@shexjs/util");

const GEN_JSONLD_CONTEXT_CONFIG = {
};


const TestJsonResourceInstances = [
  'playground-Patient',
  'playground-Observation',
  'playground-CodeSystem',
/*
  'playground-Medication',
  'playground-AllergyIntollerance',
  'playground-Bundle',
*/
];

describe("flat", () => {
  test.each(TestJsonResourceInstances)('nquads(%s) ', makeTester('../fhir-flat.shexj', 'flat', 'RDVch'));
});

describe("nested", () => {
  test.each(TestJsonResourceInstances)('nquads(%s) ', makeTester('../fhir-nest.shexj', 'nest', 'RDVch'));
});

function makeTester (shexjFile, nestings, axes) {
  const schema = JSON.parse(Fs.readFileSync(Path.join(__dirname, shexjFile), 'utf8'));
  const contextGenerator = new FhirJsonLdContextGenerator(schema);

  // Return a jest test function.
  return async (filename) => { // the WebStorm recipe has a space in the name
    // Calculate paths for source and expected data.
    const instanceFile = Path.join(__dirname, `json/${filename}.json`);
    const referenceContexts = Path.join(__dirname, `json/${filename}-${nestings}-contexts.json`);

    // Parse and pre-process source data.
    const json = await Fs.promises.readFile(instanceFile, 'utf8');
    const patient = JSON.parse(json);
    const preprocessor = new FhirPreprocessors.FhirR4Preprocessor(schema);
    const preProcessed = JSON.parse(preprocessor.preprocess(patient));

    // Construct a document loader which will record generated contexts.
    const generatedContexts = {}; // all generated contexts by URL
    Jsonld.documentLoader = makeDocumentLoader(contextGenerator, generatedContexts);

    // Run the JSON-LD transform which will call the document loader.
    const nquads = await Jsonld.toRDF(preProcessed, {format: 'application/n-quads'});

    // Test against (or generate, if first time this TestJsonResourceInstances has been run) expected contexts:
    if (Fs.existsSync(referenceContexts)) {
      // test the expected contexts.
      try {
        expect(generatedContexts).toEqual(JSON.parse(await Fs.promises.readFile(referenceContexts, 'utf8')));
      } catch (e) {
        await Fs.promises.writeFile(referenceContexts + '-got', JSON.stringify(generatedContexts, null, 2));
        throw e;
      }
    } else {
      // still generating them, ideally should happen once per test addition.
      Fs.writeFileSync(referenceContexts, JSON.stringify(generatedContexts, null, 2));
    }

    // Test the reference nquads.
    const expected = await Fs.promises.readFile(`./test/ttl/${filename}.${axes}.nt`, 'utf8');
    // Crappy test ignores graph isomorphism, but good enough for now.
    expect(nquads).toEqual(expected);
  }
}

function makeDocumentLoader (contextGenerator, generatedContexts) {
  return async function (url) {
    // Make sure its one we know how to generate.
    if (url.startsWith(FhirJsonLdContextGenerator.STEM) && url.endsWith(FhirJsonLdContextGenerator.SUFFIX)) {

      // Calculate the name of the associated FHIR Resource.
      const genMe = url.substr(FhirJsonLdContextGenerator.STEM.length, url.length - FhirJsonLdContextGenerator.STEM.length - FhirJsonLdContextGenerator.SUFFIX.length);
      try {
        // Generate the context and store create a JSON-LD API document for it.
        const context = await contextGenerator.genJsonldContext(genMe, GEN_JSONLD_CONTEXT_CONFIG);
        const ret = {
          contextUrl: null,
          documentUrl: url,
          document: JSON.stringify(context, null, 2)
        };

        // Record in passed object to make testing easy.
        generatedContexts[url] = context;

        // Return document descriptor to JSON-LD process
        return Promise.resolve(ret);
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
    throw new Error(`This test should not resolve any context urls outside of "${FhirJsonLdContextGenerator.STEM}%s${FhirJsonLdContextGenerator.SUFFIX}".`);
    // return xhrDocumentLoader(url);
  }
}
