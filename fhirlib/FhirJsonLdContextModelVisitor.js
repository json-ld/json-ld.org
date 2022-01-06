const {FhirRdfModelGenerator, ModelVisitor} = require('./FhirRdfModelGenerator');

class FhirJsonLdContextModelVisitor extends ModelVisitor {

  static HEADER = {
    "@version": 1.1,
    "@vocab": "http://example.com/UNKNOWN#",
  };

  static NAMESPACES = {
    "fhir": "http://hl7.org/fhir/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "owl": "http://www.w3.org/2002/07/owl#",
  }

  static TYPE_AND_INDEX = {
    "resourceType": {
      "@id": "rdf:type",
      "@type": "@id"
    },
    "index": {
      "@id": "fhir:index",
      "@type": "http://www.w3.org/2001/XMLSchema#integer"
    },
  };

  static GEND_CONTEXT_SUFFIX = ".context.jsonld";

  constructor(resources, datatypes, valuesets) {
    super(resources, datatypes, valuesets);
    this.cache = new Map(); // not used yet
  }

  genJsonldContext (target, config) {
    if (!(target in this.cache)) {
      this.ret = [{
        '@context': Object.assign(
          {},
          FhirJsonLdContextModelVisitor.HEADER,
          FhirJsonLdContextModelVisitor.NAMESPACES,
          FhirJsonLdContextModelVisitor.TYPE_AND_INDEX
        )
      }];
      const modelGenerator = new FhirRdfModelGenerator(this.resources, this.datatypes, this.valuesets);
      modelGenerator.visitResource(target, this, config);
      this.cache.set(target, this.ret[0]);
    }
    return this.cache.get(target);
  }

  enter (propertyMapping) {
    const nestedElt = {
      '@id': propertyMapping.predicate,
      '@context': Object.assign({}, FhirJsonLdContextModelVisitor.TYPE_AND_INDEX),
    }
    this.ret[0]["@context"][propertyMapping.property] = nestedElt;
    this.ret.unshift(nestedElt);
  }

  element (propertyMappings) {
    propertyMappings.forEach(propertyMapping => {
      if (propertyMapping.isScalar) {
        this.ret[0]["@context"][propertyMapping.property] = {
          '@id': propertyMapping.predicate,
          '@type': propertyMapping.type.datatype,
        };
      } else {
        const type = propertyMapping.type === 'code' // TODO: really? check out Patient.gender
              ? 'string'
              : propertyMapping.type.startsWith(FhirRdfModelGenerator.FHIRPATH_ROOT)
              ? propertyMapping.type.substr(FhirRdfModelGenerator.FHIRPATH_ROOT.length)
              : propertyMapping.type;
        this.ret[0]["@context"][propertyMapping.property] = {
          '@id': propertyMapping.predicate,
          '@context': type.toLowerCase() + FhirJsonLdContextModelVisitor.GEND_CONTEXT_SUFFIX,
        };
      }
    });
  }

  exit (propertyMapping) {
    this.ret.shift();
  }
};

if (typeof module !== 'undefined')
  module.exports = FhirJsonLdContextModelVisitor;
