/**
 *
 */
const {PropertyMapping} = require('./FhirRdfModelGenerator');
const {FhirProfileStructure} = require('./FhirProfileStructure')
const P = require('./Prefixes');

const N3Store = require('n3/lib/N3Store').default;

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
    printer.addQuads([typeTriple, rootTriple]);

    const target = type.toLowerCase();
    this.visitResource(target, config, printer, root);
    let ret = null;
    printer.end((error, result) => {
      if (error)
        throw new Error(error);
      ret = result;
    });
    // console.log(this.store.size)
    return ret;
  }

  visitResource(target, config, printer, root) {
    const contentModel = new FhirProfileStructure(this.structureMap, this.datatypeMap).walk(target, config);
    this.visitContentModel(contentModel, config, printer, root);
  }

  visitContentModel(contentModel, config, printer, node) {
    contentModel.forEach(pMap => {
      const all = this.takeAll(node, pMap.propertyMapping.predicate, null);
      all.forEach(q => {
        printer.addQuad(q);
        if ('contentModel' in pMap) {
          this.visitContentModel(pMap.contentModel, config, printer, q.object)
        } else {
          const type = pMap.propertyMapping.type;
          const typeEnding = '.context.jsonld';
          if (type.endsWith(typeEnding)) {
            const target = type.substr(0, type.length - typeEnding.length).toLowerCase();
            this.visitResource(target, config, printer, q.object);
          }
        }
      })
    })
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
