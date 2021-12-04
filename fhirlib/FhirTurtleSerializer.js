/**
 *
 */
const {PropertyMapping} = require('./FhirRdfModelGenerator');
const {FhirProfileStructure} = require('./FhirProfileStructure')
const P = require('./Prefixes');

const N3Store = require('n3/lib/N3Store').default;

const NS_fhir = "http://hl7.org/fhir/";

class Serializer {
  store = null;

  constructor(structureMap, datatypeMap) {
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
  }

  print(resource, printer, config) {
    this.store = new N3Store();
    this.store.addQuads(resource.store.getQuads());
    const rootTriple = this.expectOne(null, P.fhir + 'nodeRole', P.fhir + 'treeRoot');
    const root = rootTriple.subject;
    const typeTriple = this.expectOne(root, P.rdf + 'type', null);
    const type = this.expectFhirResource(typeTriple.object);
    const target = type.toLowerCase();
//     console.log(`# serializing ${target} ${root.id}
// ${c(root.id)} a ${c(type)} ;
//   fhir:nodeRole fhir:treeRoot;
// `);

    const predicates = new FhirProfileStructure(this.structureMap, this.datatypeMap).walk(target, config);
    printer.addQuads([typeTriple]);
    printer.addQuads([rootTriple]);
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

  takeAll(s, p, o) {
    const allMatching = this.store.getQuads(s, p, o);
    this.store.removeQuads(allMatching);
    return allMatching;
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
