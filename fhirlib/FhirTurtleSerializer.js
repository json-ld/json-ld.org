/**
 *
 */
const {PropertyMapping} = require('./FhirRdfModelGenerator');
const EvalSimple1err = require("@shexjs/eval-simple-1err");
const P = require('./Prefixes');

const N3Store = require('n3/lib/N3Store').default;
const N3DataFactory = require('n3/lib/N3DataFactory').default;
const ShExUtil = require('@shexjs/util');
const ShExValidator = require('@shexjs/validator');

class Serializer {
  store = null;

  constructor(schema) {
    this.schema = schema;
  }

  addResource(resource, printer, config, rest = new N3Store()) {
    const rootTriple = this.expectOne(resource.store.getQuads(null, P.fhir + 'nodeRole', P.fhir + 'treeRoot'), 'nodeRole treeRoot');
    const node = rootTriple.subject;
    const typeTriple = this.expectOne(resource.store.getQuads(node, P.rdf + 'type', null), 'fhir type');
    const type = this.expectFhirResource(typeTriple.object);
    // printer.addQuads([typeTriple, rootTriple]);

    const shape = P.fhirshex + type;
    const db = ShExUtil.rdfjsDB(resource.store, null); // no query tracker needed
    const validator = ShExValidator.construct(this.schema, db, {
      regexModule: EvalSimple1err
    });
    const res = validator.validate([{node, shape}]);
    // if (process.env.DEBUG) { console.log('validation res: ' + JSON.stringify(res, null, 2)) };

    // Test for .solution because `<S> .` or `<S> {}` will pass with no solutions.
    // This is analogous to testing for `("referenced" in s)` in a TestedTriple.
    if (!("solution" in res))
      throw res;
    const matched = [];
    const matchedDb = {
      addQuad: function (q) { matched.push(q); }
    }
    ShExUtil.getProofGraph(res, matchedDb, N3DataFactory);
    if (rest) {
      rest.addQuads(resource.store.getQuads()); // the resource giveth
      matched.forEach(q => rest.removeQuad(q)); // the matched taketh away
    }

    printer.addQuads(matched.filter(q => (['first', 'rest']).map(l => P.rdf + l).indexOf(q.predicate.value) === -1));
    return this;
  }

  addRest(restDb, printer, config, comment = "\n# remaining triples:") {
    if (restDb.size > 0) {
      printer.comment(comment);
      printer.addQuads(restDb.getQuads());
    }
  }

  expectOne(oneQuad, description) {
    if (oneQuad.length !== 1) {
      throw new Error(`Expected 1, got ${oneQuad.length} matches for ${description}`);
    }
    // this.store.removeQuads(oneQuad);
    return oneQuad[0];
  }

  expectFhirResource(node) {
    // if (node.id.startsWith())
    return node.id.substr(P.fhir.length);
  }
}

if (typeof module !== 'undefined')
  module.exports = {Serializer};
