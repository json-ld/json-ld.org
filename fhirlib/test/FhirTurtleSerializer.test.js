const Fs = require('fs');
const Jsonld  = require('jsonld');
const TurtleParser = require('../TurtleParser');
const FhirTurtleSerializer = require('../FhirTurtleSerializer');

test('asdf', async () => {
  const filename = 'playground-Patient';
  const parser = new TurtleParser.TurtleParser();
  const filepath = `./test/ttl/${filename}.ttl`;
  const config = {};
  const res = await parser.parseFile(filepath, config);
  expect(res.base).toEqual('file://' + filepath);
  expect(res.store.size).toBeGreaterThan(50);
  const serializer = new FhirTurtleSerializer.Serializer(res);
  const printer = new FhirTurtleSerializer.Printer();
  const pretty = serializer.print(printer);
  expect(pretty.length).toBeGreaterThan(1);
});
