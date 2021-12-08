const DEBUG = false;

const Fs = require('fs');
const Jsonld  = require('jsonld');
const TurtleParser = require('../TurtleParser');
const FhirTurtleSerializer = require('../FhirTurtleSerializer').Serializer;
const NestedWriter = require('../NestedWriter').Printer;
const R5StructureDefintions = require('../../playground/R5-StructureDefinitions-no-ws.js');
const R5Datatypes = require('../../playground/R5-Datatypes-no-ws.js');
const P = require('../Prefixes')

const N3Store = require('n3/lib/N3Store').default;

const indexFhir = (acc, entry) => {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};
const FHIRStructureMap = R5StructureDefintions.entry.reduce(indexFhir, {});
const FHIRDatatypeMap = R5Datatypes.entry.reduce(indexFhir, {});

test('FhirTurtleSerializer', async () => {
  const filename = 'playground-Patient';
  const parser = new TurtleParser.TurtleParser();
  const filepath = `./test/ttl/${filename}.ttl`;
  const config = {};
  const resource = await parser.parseFile(filepath, config);
  expect(resource.base).toEqual('file://' + filepath);
  expect(resource.store.size).toBeGreaterThan(50);
  const serializer = new FhirTurtleSerializer(FHIRStructureMap, FHIRDatatypeMap);
  const printer = new NestedWriter(null, {
    lists: {},
    format: 'text/turtle',
    baseIRI: resource.base,
    prefixes: P,
    version: 1.1,
    indent: '    ',
    checkCorefs: n => false,
  });
  const restDb = new N3Store();
  const pretty = serializer.print(resource, printer, {}, restDb);
  if (DEBUG)
    console.log(pretty);
  expect(pretty.length).toBeGreaterThan(1);
  if (DEBUG) {
    const restWriter = new NestedWriter(null, {
      lists: {},
      format: 'text/turtle',
      baseIRI: resource.base,
      prefixes: P,
      version: 1.1,
    });
    restWriter.addQuads(restDb.getQuads());
    let restStr = null;
    restWriter.end((error, result) => {
      if (error)
        throw new Error(error);
      restStr = result;
    });
    console.log(
      restDb.size,
      restDb.getQuads().map(q => `${q.subject.id} ${q.predicate.id} ${q.object.id} .`).join('\n'),
      restStr
    );
  }
});
