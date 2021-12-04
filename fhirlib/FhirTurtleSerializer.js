/**
 *
 */
const R5Datatypes = require('../playground/R5-Datatypes-no-ws');
const R5StructureDefintions = require('../playground/R5-StructureDefinitions-no-ws');
const P = require('./Prefixes');

const {FhirProfileVisitor, Nesting} = require('./FhirRdfModelGenerator');
const N3Store = require('n3/lib/N3Store').default;

class FhirProfilePredicates extends FhirProfileVisitor {

  constructor(structureMap, datatypeMap) {
    super(structureMap, datatypeMap);
  }

  walk (target, config) {
    this.ret = [[]];
    this.visitResource(target, config);
    return this.ret[0];
  }

  enter (nesting) {
    const nestedElt = []
    this.ret[0].push(nesting.property);
    this.ret.unshift(nestedElt);
  }

  scalar (nesting) {
    this.ret[0].push(nesting.property);
  }

  complex (nesting) {
    this.ret[0].push(nesting.property);
  }

  exit (nesting) {
    this.ret.shift();
  }
};

class Serializer {
  store = null;

  constructor(structureMap, datatypeMap) {
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
  }

  print(resource, printer, config) {
    this.store = new N3Store();
    this.store.addQuads(resource.store.getQuads());
    const root = this.expectOne(null, P.fhir + 'nodeRole', P.fhir + 'treeRoot').subject;
    const target = this.expectFhirResource(this.expectOne(root, P.rdf + 'type', null).object).toLowerCase();
    console.log(`serializing ${target} ${root.id}`);

    const predicates = new FhirProfilePredicates(this.structureMap, this.datatypeMap).walk(target, config);
    const neighborhood = this.store.getQuads(root, null, null);
    this.walk(root, target, neighborhood, '  ');
    return 'ab';
  }

  walk(root, target, printer, neighborhood, indent) {
    return [];
  }

  expectOne(s, p, o) {
    const oneQuad = this.store.getQuads(s, p, o);
    if (oneQuad.length !== 1) {
      throw new Error(`Expected 1, got ${oneQuad.length} matches for {${s} ${p} ${o}}`);
    }
    this.store.removeQuads(oneQuad);
    return oneQuad[0];
  }

  expectFhirResource(node) {
    // if (node.id.startsWith())
    return node.id.substr(P.fhir.length);
  }
}

const indexFhir = (acc, entry) => {
  acc[entry.resource.id.toLowerCase()] = entry.resource;
  return acc;
};

if (typeof module !== 'undefined')
  module.exports = {Serializer};
