const Fs = require('fs');
const Path = require('path');
const Jsonld  = require('jsonld');
const JsonLdError = require('jsonld/lib/JsonLdError');
const {DefinitionBundleLoader} = require('../FhirRdfModelGenerator');
const FhirJsonLdContextModelVisitor = require('../FhirJsonLdContextModelVisitor');
const FhirPreprocessors = require('../FhirPreprocessors');

const GEN_JSONLD_CONTEXT_CONFIG = {
};

let R5Resources, R5Datatypes; // set in beforeAll
beforeAll(async () => {
  [R5Resources, R5Datatypes] = (
    await Promise.all(
      ['Resources', 'Datatypes']
        .map(f => Path.join(__dirname, `../../playground/R5-${f}-no-ws.json`))
        .map(p => Fs.promises.readFile(p))
    ))
    .map(JSON.parse);
});

const Generatod = {}; // all generated contexts by URL

Jsonld.documentLoader = function(url) {
  if (url.startsWith(FhirJsonLdContextModelVisitor.STEM) && url.endsWith(FhirJsonLdContextModelVisitor.SUFFIX)) {
    const genMe = url.substr(FhirJsonLdContextModelVisitor.STEM.length, url.length - FhirJsonLdContextModelVisitor.STEM.length - FhirJsonLdContextModelVisitor.SUFFIX.length);
    const definitionLoader = new DefinitionBundleLoader(R5Resources, R5Datatypes, undefined /* not needed for JSON-LD context generation */);
    const generator = new FhirJsonLdContextModelVisitor(definitionLoader);
    const resourceDef = definitionLoader.getStructureDefinitionByName(genMe, GEN_JSONLD_CONTEXT_CONFIG);
    const context = generator.genJsonldContext(resourceDef || {id: 'root'}, GEN_JSONLD_CONTEXT_CONFIG);
    const ret = {
      contextUrl: null,
      documentUrl: url,
      document: JSON.stringify(context, null, 2)
    };
    Generatod[url] = context;
    return Promise.resolve(ret);
  }
  throw new Error(`Expected only FhirRdf URLs; got ${url}`);
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
    const schemaFile = Path.join(__dirname, `../fhir-flat.shexj`);
    const referenceContexts = Path.join(__dirname, `json/${filename}-contexts.json`);

    const patient = JSON.parse(await Fs.promises.readFile(instanceFile, 'utf8'));
    const shexj = JSON.parse(await Fs.promises.readFile(schemaFile, 'utf8'))
    const preprocessor = new FhirPreprocessors.FhirR4Preprocessor(shexj);
    const preProcessed = JSON.parse(preprocessor.preprocess(patient));
    try {
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
    } catch (e) {
      throw e instanceof JsonLdError && 'details' in e && 'cause' in e.details
        ? e.details.cause
        : e;
    }
  });
});
