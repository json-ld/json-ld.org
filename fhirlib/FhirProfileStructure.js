const {FhirRdfModelGenerator, JsonRdfPropertyMapping} = require('./FhirRdfModelGenerator');

class FhirProfileStructure {

    constructor(structureMap, datatypeMap) {
        this.structureMap = structureMap;
        this.datatypeMap = datatypeMap;
    }

    walk (target, config) {
        this.ret = [[]];
        const modelGenerator = new FhirRdfModelGenerator(this.structureMap, this.datatypeMap);
        modelGenerator.visitResource(target, this, config);
        return this.ret[0];
    }

    enter (nesting) {
        const nestedElt = []
        this.ret[0].push({nesting, nestedElt});
        this.ret.unshift(nestedElt);
    }

    scalar (nesting) {
        this.ret[0].push({nesting});
    }

    complex (nesting) {
        this.ret[0].push({nesting});
    }

    exit (nesting) {
        this.ret.shift();
    }
};

if (typeof module !== 'undefined')
    module.exports = {FhirProfileStructure};