/**
 *
 */
const R5Datatypes = require('../playground/R5-Datatypes-no-ws');
const R5StructureDefintions = require('../playground/R5-StructureDefinitions-no-ws');
const P = require('./Prefixes');

class Printer {

}

class Serializer {
    store = null;
    constructor(resource, config) {
        this.store = resource.store;
        this.config = config;
        this.structureMap = R5StructureDefintions.entry.reduce(indexFhir, {});
        this.datatypeMap = R5Datatypes.entry.reduce(indexFhir, {});
    }
    print(printer) {
        const root = this.expectOne(null, P.fhir + 'nodeRole', P.fhir + 'treeRoot').subject;
        const type = this.expectFhirResource(this.expectOne(root, P.rdf + 'type', null).object);
        console.log(`serializing ${type} ${root.id}`);

        const neighborhood = this.store.getQuads(root, null, null);
        this.walk(root, type.toLowerCase(), neighborhood, '  ');
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
    module.exports = {Serializer, Printer};