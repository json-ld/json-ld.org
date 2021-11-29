  const CODE_SYSTEM_MAP = {
    "http://snomed.info/sct": "sct",
    "http://loinc.org": "loinc"
  };

  function parseResourceType(resourceType) {
    return resourceType.includes(':') ? resourceType.split(':')[1] : resourceType
  }

  class FhirR5Preprocessor {
    constructor() {
      this.resourceTypeSet = new Set();
    }

    preprocess(input) {
      if ('@context' in input) {
        return "input preprocessed";
      }
      let resourceType;
      if (input.resourceType) {
        resourceType = parseResourceType(input.resourceType);
        this.resourceTypeSet.add(resourceType);
      }
      input['nodeRole'] = 'fhir:treeRoot';

      // TODO: replace this with @included once the bug is fixed
      let graph = this.processFhirObject(input, resourceType);

      // add ontology header
      let hdr = {};
      hdr['@id'] = graph['@id'] + '.ttl';
      hdr['owl:versionIRI'] = hdr['@id'];
      hdr['owl:imports'] = 'fhir:fhir.ttl';
      hdr["@type"] = 'owl:Ontology';

      let output = { ...graph, "@included": hdr };

      let context = [];
      if (this.resourceTypeSet.size > 0) {
        Array.from(this.resourceTypeSet).sort().forEach(rt => {
          context.push(this.getFhirContextUrl(rt));
        })
        context.push(this.getFhirContextUrl('root'));
      }
      context.push({
        '@base': 'http://hl7.org/fhir/',
        'nodeRole': { '@type': '@id', '@id': 'fhir:nodeRole' },
        'owl:imports': { '@type': '@id' },
        'owl:versionIRI': { '@type': '@id' },
      });
      output = { '@context': context, ...output };

      return JSON.stringify(output, null, 2);
    }

    getFhirContextUrl(resourceType) {
      return `https://fhircat.org/fhir-r5/original/contexts/${resourceType.toLowerCase()}.context.jsonld`
      // return `https://fhircat.org/fhir/contexts/r5/${resourceType.toLowerCase()}.context.jsonld`
      // return `https://raw.githubusercontent.com/fhircat/jsonld_context_files/master/contextFiles/${resourceType.toLowerCase()}.context.jsonld`;
    }

    fromFhirValue(value) {
      return value['value'] || value
    }

    toFhirValue(value) {
      return value;
    };

    addTypeArc(value) {
      if (value.system && value.code) {
        let system = this.fromFhirValue(value.system);
        let code = this.fromFhirValue(value.code);
        let system_root = '/#'.includes(system.slice(-1)) ? system.slice(0, -1) : system;
        let base;
        if (system_root in CODE_SYSTEM_MAP) {
          base = CODE_SYSTEM_MAP[system_root] + ':'
        } else {
          base = system + ('/#'.includes(system.slice(-1)) ? '' : '/')
        }
        value['@type'] = base + code
      }
      return value
    }

    processFhirObject(fhirObj, resourceType, inside=false) {
      for (let key in fhirObj) {
        let value = fhirObj[key];
        if (key.startsWith('@')) {
          continue;
        } else if (Array.isArray(value)) {
          fhirObj[key] = this.processFhirArray(key, value);
        } else if (typeof value === 'object') {
          fhirObj[key] = this.processFhirObject(value, resourceType, true)
        } else if (key === 'id') {
          fhirObj['@id'] = (inside && !value.startsWith('#') ? '#' : resourceType + '/') + value
          fhirObj.id = this.toFhirValue(fhirObj.id)
        } else if (key === 'reference') {
          if (!('link' in fhirObj)) {
            fhirObj['fhir:link'] = this.genFhirReference(fhirObj);
          }
          fhirObj[key] = this.toFhirValue(value)
        } else if (key === 'resourceType' && !(value.startsWith('fhir:'))) {
          this.resourceTypeSet.add(value);
          fhirObj[key] = 'fhir:' + value;
        } else if (!['nodeRole', 'index', 'div'].includes(key)) {
          fhirObj[key] = this.toFhirValue(value);
        }
        if (key === 'coding') {
          fhirObj[key] = value.map(n => this.addTypeArc(n))
        }
      }
      return fhirObj;
    }

    processExtensions(fhirObj) {
      // merge extensions
      for (let key in fhirObj) {
        if (!key.startsWith('_')) {
          continue;
        }
        let baseKey = key.substr(1);
        if (fhirObj[baseKey] && typeof fhirObj[baseKey] === 'object') {
          for (let subkey in fhirObj[key]) {
            if (subkey in fhirObj[baseKey]) {
              console.log(`Extension object ${subkey} is already in the base for ${key}`)
            } else {
              fhirObj[baseKey][subkey] = fhirObj[key][subkey]
            }
          }
        } else {
          console.log(`Badly formed extension element: ${key}`);
        }
        delete fhirObj[key]
      }
      return fhirObj;
    }

    processFhirArray(key, value) {
      return value.map((e, i) => {
        if (Array.isArray(e)) {
          console.log(`Problem: ${key} has a list in a list`)
        } else if (typeof e === 'object') {
          let v = this.processFhirObject(e)
          v['index'] = i
          return v
        } else {
          let v = this.toFhirValue(e)
          if (typeof v === 'object') {
            v['index'] = i
          }
          return v
        }
      })
    }

    genFhirReference(fhirObj) {
      let typ, link
      if (!fhirObj.reference.includes('://') && !fhirObj.reference.startsWith('/')) {
        typ = 'type' in fhirObj ? fhirObj.type : fhirObj.reference.split('/', 1)[0]
        link = '../' + fhirObj.reference
      } else {
        link = fhirObj.reference;
        typ = fhirObj.type
      }
      let rval = { '@id': link };
      if (typ) {
        rval['@type'] = 'fhir:' + typ
      }
      return rval
    }
  }

  class FhirR4Preprocessor extends FhirR5Preprocessor {
    toFhirValue(value) {
      return { 'value': value }
    }

    processFhirObject(fhirObj, resourceType, inside=false) {
      fhirObj = super.processFhirObject(fhirObj, resourceType, inside);
      fhirObj = this.processExtensions(fhirObj);
      return fhirObj;
    }

    getFhirContextUrl(resourceType) {
      return `https://fhircat.org/fhir-r4/original/contexts/${resourceType.toLowerCase()}.context.jsonld`
      // return `https://fhircat.org/fhir/contexts/r5/${resourceType.toLowerCase()}.context.jsonld`
      // return `https://raw.githubusercontent.com/fhircat/jsonld_context_files/master/contextFiles/${resourceType.toLowerCase()}.context.jsonld`;
    }
  }

if (typeof module !== 'undefined')
  module.exports = { FhirR4Preprocessor, FhirR4Preprocessor };
