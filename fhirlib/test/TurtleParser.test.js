const Fs = require('fs');
const Jsonld  = require('jsonld');
const TurtleParser = require('../TurtleParser.js');
const Path = require("path");

test('TurtleParserTest', async () => {
  const filename = 'playground-Patient';
  const axes = 'RDVch';
  const printer = new TurtleParser.TurtleParser();
  const filepath = `./test/ttl/${filename}.${axes}.ttl`;
  const res = await printer.parseFile(filepath);
  expect(res.base).toEqual('file://' + filepath);
  expect(res.store.size).toBeGreaterThan(50);
});
