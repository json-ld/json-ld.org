/**
 */

const Fs = require('fs');
const Path = require('path');
const TurtleParser = require('../TurtleParser');
const FhirTurtleSerializer = require('../FhirTurtleSerializer').Serializer;
const {Writer} = require('../NestedWriter');
const P = require('../Prefixes')

const N3Store = require('n3/lib/N3Store').default;

const TestJsonResourceInstances = [
/*
*/
  { f: 'playground-Patient', extra: 5 },
  { f: 'playground-Observation', extra: 3 },
  { f: 'playground-CodeSystem', extra: 3 },
/*
  { f: 'playground-Medication', extra: 5 },
  { f: 'playground-AllergyIntollerance', extra: 5 },
  { f: 'playground-Bundle', extra: 5 },
*/
];

['flat', 'nest'].forEach(
  n =>
    describe(`${n} schema`, () => {
      const tester = makeTester(`../fhir-${n}-RDVch.shexj`, 'RDVch');
      test.each(TestJsonResourceInstances)('serialize %s +%d extra triples', ({f, extra}) => tester(f, extra));
    } )
)

function makeTester (shexjFile, rdvch) {
  const schema = JSON.parse(Fs.readFileSync(Path.join(__dirname, shexjFile), 'utf8'));

  return async (filename, extraQuads) => {
    const parser = new TurtleParser.TurtleParser();
    const filepath = `./test/ttl/${filename}.${rdvch}.ttl`;
    const config = {};
    const resource = await parser.parseFile(filepath, config);
    expect(resource.base).toEqual('file://' + filepath);
    expect(resource.store.size).toBeGreaterThan(50);

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
    const serializer = new FhirTurtleSerializer(schema);

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
    // console.log(restDb.size + "\n" + pretty);

    expect(pretty.length).toBeGreaterThan(1);
    try {
      expect(restDb.size).toEqual(extraQuads); // playground-Patient has 5 remaining triples
    } catch (e) {debugger;
      e.message += "\n got:" + restDb.getQuads().map(q => (['subject', 'predicate', 'object']).map(pos => q[pos].id).join(" ")).join("\n     ");
      throw e;
    }
  }
}
