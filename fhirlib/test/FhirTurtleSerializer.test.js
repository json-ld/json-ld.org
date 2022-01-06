/**
 */

const Fs = require('fs');
const Path = require('path');
const TurtleParser = require('../TurtleParser');
const FhirTurtleSerializer = require('../FhirTurtleSerializer').Serializer;
const {Writer} = require('../NestedWriter');
const P = require('../Prefixes')

const N3Store = require('n3/lib/N3Store').default;

const indexFhir = (acc, entry) => {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};

test('FhirTurtleSerializer', async () => {
  const filename = 'playground-Patient';
  const parser = new TurtleParser.TurtleParser();
  const filepath = `./test/ttl/${filename}.ttl`;
  const config = {};
  const resource = await parser.parseFile(filepath, config);
  expect(resource.base).toEqual('file://' + filepath);
  expect(resource.store.size).toBeGreaterThan(50);
  const shexj = JSON.parse(await Fs.promises.readFile(Path.join(__dirname, '../fhir.shexj'), 'utf-8'));

  // The NestedWriter nicely nests ordered quads.
  const printer = new Writer(null, {
    lists: {},
    format: 'text/turtle',
    baseIRI: resource.base,
    prefixes: P,
    version: 1.1,
    indent: '    ',
    checkCorefs: n => false, // Assume there are no co-refs to nested BNodes.
  });

  // The FhirTurtleSerializer adds quads to the pretty-printer in the optimal order.
  const serializer = new FhirTurtleSerializer(shexj);

  // Create a Store to capture triples not part of the FHIR Resource.
  const restDb = new N3Store();

  // Send the Resource to the printer.
  serializer.addResource(resource, printer, {}, restDb);

  // Append a comment and the remaining triples.
  serializer.addRest(restDb, printer, {}, "# Triples not in FHIR Resource:");

  // Get the ouput following NestedWriter's stream convention.
  let pretty = null;
  printer.end((error, result) => {
    if (error)
      throw new Error(error);
    pretty = result;
  });
  // if (process.env.DEBUG) { console.log(restDb.size + "\n" + pretty); }

  expect(pretty.length).toBeGreaterThan(1);
  expect(restDb.size).toEqual(5); // playground-Patient has 5 remaining triples
});
