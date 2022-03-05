/*
 obsolete - enter/element/exit actions may be handy later but feel free to delete.
 */

const {FhirRdfModelGenerator, PropertyMapping, ModelVisitor} = require('./FhirRdfModelGenerator');

/**
 * produce a FHIR content model of RdfPropertyMappings collected in contentModels, e.g.:
 *   [
 *     {
 *       "propertyMapping": {
 *         "element": { "id": "Resource.id", "path": "Resource.id", ... },
 *         "property": "id",
 *         "predicate": "http://hl7.org/fhir/Resource.id",
 *         "type": "string.context.jsonld"
 *       }
 *     },
 *     {
 *       "propertyMapping": {...},
 *       "contentModel": [
 *         { "propertyMapping": {...} }
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 */
class FhirProfileStructure extends ModelVisitor {

    constructor(resources, datatypes, valuesets) {
        super(resources, datatypes, valuesets);
    }

    async walk (target, config) {
        this.ret = [[]];
        const modelGenerator = new FhirRdfModelGenerator(this.resources, this.datatypes, this.valuesets);
        await modelGenerator.visitResource(target, this, config);
        return this.ret[0];
    }

    enter (propertyMapping) {
        const contentModel = []
        this.ret[0].push({propertyMappings: [propertyMapping], contentModel});
        this.ret.unshift(contentModel);
    }

    element (propertyMappings) {
        this.ret[0].push({propertyMappings});
    }

    exit (propertyMappings) {
        this.ret.shift();
    }
};

if (typeof module !== 'undefined')
    module.exports = {FhirProfileStructure};
