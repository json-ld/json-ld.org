const CODE_SYSTEM_MAP = {
  "http://snomed.info/sct": "sct",
  "http://loinc.org": "loinc"
};
const NS_fhir = "http://hl7.org/fhir/shape/";
const NS_xsd = "http://www.w3.org/2001/XMLSchema#";

function parseResourceType(resourceType) {
  return resourceType.includes(':') ? resourceType.split(':')[1] : resourceType
}

class FhirR5Preprocessor {
  constructor (shexj, opts = {axes: {r:true, d:true, v:true, c:false, h:false}}) {
    this.shexj = shexj;
    this.opts = opts;
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
    let graph = this.processFhirObject(input, this.shexj.shapes.find(s => s.id === NS_fhir + resourceType), resourceType);

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
    return `https://fhircat.org/fhir-r5/original/contexts/${resourceType}.context.jsonld`
    // return `https://fhircat.org/fhir/contexts/r5/${resourceType}.context.jsonld`
    // return `https://raw.githubusercontent.com/fhircat/jsonld_context_files/master/contextFiles/${resourceType}.context.jsonld`;
  }

  fromFhirValue(value) {
    return value['value'] || value
  }

  toFhirValue(value) {
    return value;
  };

  addTypeArc(value) {
    if (value.system && value.code) {
      let system = this.valueOf(this.fromFhirValue(value.system));
      let code = this.valueOf(this.fromFhirValue(value.code));
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

  valueOf (v) {
    if (this.opts.axes.h) { return v; }
    return v['@value'];
  }

  processFhirObject(fhirObj, schemaObject, resourceType, inside = false) {
    for (let key in fhirObj) {
      let value = fhirObj[key];
      if (key.startsWith('@')) {
        continue;
      } else if (key === 'resourceType') {
        if (!(value.startsWith('fhir:'))) {
          this.resourceTypeSet.add(value);
          fhirObj[key] = 'fhir:' + value;
        }
      } else {
        const [nestObject, nestType] = this.lookupNestedObject(schemaObject, resourceType, key);
        if (Array.isArray(value)) {
          fhirObj[key] = this.processFhirArray(key, value, nestObject, nestType);
        } else if (typeof value === 'object') {
          fhirObj[key] = this.processFhirObject(value, nestObject, nestType, true)
        } else if (key === 'id') {
          fhirObj['@id'] = (inside && !value.startsWith('#') ? '#' : resourceType + '/') + value
          fhirObj.id = this.toFhirValue(fhirObj.id, nestObject, nestType)
        } else if (key === 'reference') {
          if (!('link' in fhirObj)) {
            fhirObj['fhir:link'] = this.genFhirReference(fhirObj);
          }
          fhirObj[key] = this.toFhirValue(value, nestObject, nestType)
        } else if (!['nodeRole', 'index', 'div'].includes(key)) {
          fhirObj[key] = this.toFhirValue(value, nestObject, nestType);
        }
        if (key === 'coding') {
          fhirObj[key] = value.map(n => this.addTypeArc(n))
        }
      }
    }
    return fhirObj;
  }

  lookupNestedObject (schemaObject, resourceType, key) {
    let tc = undefined;
    if (schemaObject.expression.type === "TripleConstraint") {
      tc = schemaObject.expression;
    } else if (schemaObject.expression.type === "EachOf") {
      for (let i = 0; tc === undefined && i < schemaObject.expression.expressions.length; ++i) {
        const eachOfTE = schemaObject.expression.expressions[i];
        if (eachOfTE.type === "TripleConstraint") {
          if (eachOfTE.predicate.endsWith('.' + key) || eachOfTE.predicate.endsWith('/' + key)/* nodeRole */) {
            tc = eachOfTE;
          }
        } else if (eachOfTE.type === "OneOf") {
          tc = eachOfTE.expressions.find(oneOfTE => oneOfTE.predicate.endsWith('.' + key));
        } else throw Error("HERE");
      }
    }
    if (!tc) throw Error(`Can't find ${resourceType}.${key} in ${schemaObject}`);
    let te = null;
    if (typeof tc.valueExpr === "object") {
      if (tc.valueExpr.type === "ShapeAnd") {
        te = tc.valueExpr.shapeExprs[0];
      } else if (tc.valueExpr.type === "ShapeOr") {
        return [tc.valueExpr, resourceType];
      } else if (tc.valueExpr.type === "NodeConstraint") {
        return [tc.valueExpr, resourceType];
      } else if (tc.valueExpr.type === "Shape") { // nested shapes shows up only in nested schemas
        return [tc.valueExpr, resourceType];
      } else throw Error("HERE");
    } else if (typeof tc.valueExpr === "string") {
      if (!tc.valueExpr.startsWith(NS_fhir)) throw Error(`unexpected valueExpr in ${tc}`);
      te = tc.valueExpr;
    } else throw Error("HERE");
    const nestObject = this.shexj.shapes.find(se => se.id === te);
    const nestType = te.substr(NS_fhir.length);
    return [nestObject, nestType];
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

  processFhirArray(key, value, schemaObject, resourceType) {
    return value.map((e, i) => {
      if (Array.isArray(e)) {
        console.log(`Problem: ${key} has a list in a list`)
      } else if (typeof e === 'object') {
        let v = this.processFhirObject(e, schemaObject, resourceType)
        v['index'] = i
        return v
      } else {
        let v = this.toFhirValue(e, schemaObject, resourceType)
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

const UnionedTypes = {
  dateTime: { pattern: /^[+-]?\d{4}-[01]\d-[0-3]\dT[0-5]\d:[0-5]\d:[0-5]\d(\.\d+)?([+-][0-2]\d:[0-5]\d|Z)?$/, dt: "xsd:dateTime" },
  date: { pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, dt: "xsd:date" },
  gYearMonth: { pattern: /^[0-9]{4}-[0-9]{2}$/, dt: "xsd:gYearMonth" },
  gYear: { pattern: /^[0-9]{4}$/, dt: "xsd:gYearMonth" },
  decimal: { pattern: /^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)$/, dt: "xsd:decimal" },
  double: { pattern: /^[+-]?(?:[0-9]*\.[0-9]+|[0-9]+)E[+-]?(?:[0-9]+)$/, dt: "xsd:double" },
};

class FhirR4Preprocessor extends FhirR5Preprocessor {
  toFhirValue(value, schemaObject, nestType) {
    if (this.opts.axes.h) { return value; }

    const [nestScalar, t] = this.lookupNestedObject(schemaObject, nestType, "value");
    if (nestScalar.type === "NodeConstraint") {
      return { value: {
        "@type": nestScalar.datatype.replace(/^http:\/\/www\.w3\.org\/2001\/XMLSchema#/, "xsd:"),
        "@value": value,
      } }
    } else if (nestScalar.type === "ShapeOr") {
      const ut = nestScalar.shapeExprs.map(
          nc => UnionedTypes[nc.datatype.substr(NS_xsd.length)]
      ).find(
          t => t.pattern.test(value)
      );
      return { value: { '@type': ut.dt, '@value': value } };
    } else {
      console.log("HERE");
    }
    return { 'value': value }
  }

  processFhirObject(fhirObj, schemaObject, resourceType, inside = false) {
    fhirObj = super.processFhirObject(fhirObj, schemaObject, resourceType, inside);
    fhirObj = this.processExtensions(fhirObj);
    return fhirObj;
  }

  getFhirContextUrl(resourceType) {
    return `https://fhircat.org/fhir-r4/original/contexts/${resourceType}.context.jsonld`
    // return `https://fhircat.org/fhir/contexts/r5/${resourceType}.context.jsonld`
    // return `https://raw.githubusercontent.com/fhircat/jsonld_context_files/master/contextFiles/${resourceType}.context.jsonld`;
  }
}

if (typeof module !== 'undefined')
  module.exports = { FhirR5Preprocessor, FhirR4Preprocessor };
