const SHEXJ_FILE = '../fhir.shexj';

const Fs = require('fs');
const Path = require('path');
const FhirShExJGenerator = require('../FhirShExJGenerator.js');
const FhirPreprocessors = require('../FhirPreprocessors.js');

const GEN_SHEXJ_CONTEXT_CONFIG = {
  addValueSetVersionAnnotation: false, // handle e.g. "http://hl7.org/fhir/ValueSet/medicationrequest-status|4.6.0"
  oloIndexes: true,
};

const GEN_SHEXJ_STEM = 'http://hl7.org/fhir/StructureDefinition/';
const CODE_SYSTEM_STEM = 'http://hl7.org/fhir/CodeSystem/';
const VALUE_SET_STEM = 'http://hl7.org/fhir/ValueSet/';

const indexFhir = (acc, entry) => {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};

const SKIP = ['BackboneElement', 'base', 'DomainResource', 'Element', 'integer', 'BackboneType', 'DataType', 'PrimitiveType'];

const GenTests = [
  {resources: 'fhir/medreq-min-resources.json', datatypes: 'fhir/medreq-min-types.json', valuesets: 'fhir/medreq-min-valuesets.json', skip: SKIP, expected: 'fhir/medreq-min-expected.shexj', got: 'fhir/medreq-min-got.shexj'}
]

// test('generate $ expected from $ resources and $ datatypes', async () => {const {resources, datatypes, skip, expected, got} = GenTests[0];
test.each(GenTests)('generate $expected from $resources and $datatypes', async ({resources, datatypes, valuesets, skip, expected, got}) => {
  // Generate in memory
  // const generator = new FhirShExJGenerator(FHIRStructureMap, FHIRDatatypeMap);
  const parsedResources = await readJsonProfile(Path.join(__dirname, resources));
  const parsedDatatypes = await readJsonProfile(Path.join(__dirname, datatypes));
  const parsedValuesets = await readJsonProfile(Path.join(__dirname, valuesets));
  const generator = new FhirShExJGenerator(
      parsedResources.entry.reduce(indexFhir, {}),
      parsedDatatypes.entry.reduce(indexFhir, {}),
      parsedValuesets.entry.reduce(indexFhir, {}),
      GEN_SHEXJ_CONTEXT_CONFIG
  );
  const sources = [parsedResources, parsedDatatypes, parsedValuesets];
  const generated = sources.reduce((generated, source) => {
    return source.entry.reduce((generated, entry) => {
      const url = entry.fullUrl;
      const genMe = url.startsWith(GEN_SHEXJ_STEM)
          ? url.substr(GEN_SHEXJ_STEM.length)
          : url.startsWith(VALUE_SET_STEM)
              ? url.substr(VALUE_SET_STEM.length)
              : url.substr(CODE_SYSTEM_STEM.length);
      try {
        if (skip.indexOf(genMe) !== -1)
          return generated;

        source.id === 'valuesets'
            ? generator.genValueset(genMe, GEN_SHEXJ_CONTEXT_CONFIG)
            : generator.genShape(genMe, true, GEN_SHEXJ_CONTEXT_CONFIG);
        return generated.concat(genMe);
      } catch (e) {
        console.warn("error trying to genShExJ:" + e.stack);
        throw e; // what does jest do with this exception?
      }
    }, generated);
  }, [])
  const allTypesLabel = Prefixes.fhirvs + 'all-types';
  generated.push('all-types');
  generator.genAllTypes(allTypesLabel, GEN_SHEXJ_CONTEXT_CONFIG);
  const ret = generator.schema;

  // Verify generated size
  expect(ret.shapes.map(s => s.id.startsWith(Prefixes.fhirshex) ? s.id.substr(Prefixes.fhirshex.length) : s.id.substr(Prefixes.fhirvs.length))).toEqual(expect.arrayContaining(generated));

  await writeShExJ(Path.join(__dirname, got), ret, false); // TODO: change to true for production

  // Parse it back
  const json = await Fs.promises.readFile(Path.join(__dirname, expected), 'utf8');
  const parsed = JSON.parse(json);

  // Verify read size
  expect(ret.shapes.map(se => se.id)).toEqual(parsed.shapes.map(se => se.id));
  expect(ret.shapes).toEqual(parsed.shapes);
});

// Write to disk with long-lines
async function writeShExJ(filename, schema, longLines) {
  const head = `{
  "type": "schema",
  "shapes": [
`;
  const tail = `  ],
  "@context": "http://www.w3.org/ns/shex.jsonld"
}
`;
  await Fs.promises.writeFile(
      filename,
      longLines
          ? head + schema.shapes.map((se, idx) => JSON.stringify(se) + (idx === schema.shapes.length - 1 ? '' : ',') + '\n').join('') + tail
          : JSON.stringify(schema, null, 2)
  );
}

async function readJsonProfile (path) {
  const text = await Fs.promises.readFile(path, 'utf8');
  const obj = JSON.parse(text);
  return obj;
}
