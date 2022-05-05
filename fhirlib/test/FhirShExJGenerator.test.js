const Fs = require('fs');
const Path = require('path');
const FhirShExJGenerator = require('../FhirShExJGenerator.js');
const {BundleDefinitionLoader} = require('../BundleDefinitionLoader');

const GEN_SHEXJ_CONTEXT_CONFIG = {
  addValueSetVersionAnnotation: false, // handle e.g. "http://hl7.org/fhir/ValueSet/medicationrequest-status|4.6.0"
  addTypesTo: ["Coding"],
  missing: {}
};

const SKIP = ['BackboneElement', 'base', 'DomainResource', 'Element', 'integer', 'BackboneType', 'DataType', 'PrimitiveType'];

const GenTests = [
  {resources: 'fhir/medreq-min-resources.json', datatypes: 'fhir/medreq-min-types.json', valuesets: 'fhir/medreq-min-valuesets.json', skip: SKIP, expected: 'fhir/medreq-min-RDVch-expected.shexj', got: 'fhir/medreq-min-RDVch-got.shexj', axes: 'RDVch'},
  {resources: 'fhir/medreq-min-resources.json', datatypes: 'fhir/medreq-min-types.json', valuesets: 'fhir/medreq-min-valuesets.json', skip: SKIP, expected: 'fhir/medreq-min-rDVch-expected.shexj', got: 'fhir/medreq-min-rDVch-got.shexj', axes: 'rDVch'},
].map(t => {
  (["resources", "datatypes", "valuesets", "expected", "got", "axes"]).forEach(attr => {
    t[attr + "Rel"] = Path.relative(process.env.PWD, Path.join(__dirname, t[attr]));
  });
  return t;
});

// test('generate $ expected from $ resources and $ datatypes', async () => {const {resources, datatypes, skip, expected, got} = GenTests[0];
test.each(GenTests)('generate $expectedRel from $resourcesRel and $datatypesRel', async ({resources, datatypes, valuesets, skip, expected, got, expectedRel, resourcesRel, datatypesRel, axes}) => {
  // Generate in memory
  // const generator = new FhirShExJGenerator(FHIRStructureMap, FHIRDatatypeMap);
  const parsedResources = await readJsonProfile(Path.join(__dirname, resources));
  const parsedDatatypes = await readJsonProfile(Path.join(__dirname, datatypes));
  const parsedValuesets = await readJsonProfile(Path.join(__dirname, valuesets));
  const definitionLoader = new BundleDefinitionLoader(parsedResources, parsedDatatypes, parsedValuesets);
  const generator = new FhirShExJGenerator(
    definitionLoader,
    Object.assign({axes}, GEN_SHEXJ_CONTEXT_CONFIG),
  );
  const generated = await generator.genShExJ([parsedResources, parsedDatatypes, parsedValuesets], skip);

  // Verify generated size
  // expect(generated.shapes.map(s => s.id.startsWith(Prefixes.fhirshex) ? s.id.substr(Prefixes.fhirshex.length) : s.id.substr(Prefixes.fhirvs.length))).toEqual(expect.arrayContaining(generated));

  await writeShExJ(Path.join(__dirname, got), generated, false); // TODO: change to true for production

  // Parse it back
  const json = await Fs.promises.readFile(Path.join(__dirname, expected), 'utf8');
  const reference = JSON.parse(json);

  // Verify read size
  // console.log(JSON.stringify(generated, null, 2));
  expect(generated.shapes.map(se => se.id)).toEqual(reference.shapes.map(se => se.id));
  // Fs.writeFileSync("/tmp/toy/generated.json", JSON.stringify(generated, null, 2), {encoding: "utf8"});
  // Fs.writeFileSync("/tmp/toy/reference.json", JSON.stringify(reference, null, 2), {encoding: "utf8"});
  expect(generated).toEqual(reference);
  expect(GEN_SHEXJ_CONTEXT_CONFIG.missing.codesystems).toEqual(new Set([
      "http://terminology.hl7.org/CodeSystem/v3-TimingEvent",
      "urn:ietf:bcp:13",
      "http://unitsofmeasure.org",
  ]))
  GEN_SHEXJ_CONTEXT_CONFIG.missing = {};
});

// Write to disk with long-lines
async function writeShExJ(filename, schema, longLines) {
  const head = `{
  "type": "Schema",
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
