const Fs = require('fs');
const Jsonld  = require('jsonld');
const TurtleParser = require('../TurtleParser');
const FhirTurtleSerializer = require('../FhirTurtleSerializer').Serializer;
const FhirTurtlePrinter = require('../FhirTurtlePrinter').Printer;
const R5StructureDefintions = require('../../playground/R5-StructureDefinitions-no-ws.js');
const R5Datatypes = require('../../playground/R5-Datatypes-no-ws.js');

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
  const printer = new FhirTurtlePrinter();
  const pretty = serializer.print(resource, printer, {});
  expect(pretty.length).toBeGreaterThan(1);
});
