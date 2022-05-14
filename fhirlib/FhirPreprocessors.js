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
    return value['value'] || value['@value'] || value
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
          tc = eachOfTE.expressions.find(oneOfTE => oneOfTE.predicate.endsWith('.' + key) || oneOfTE.predicate.endsWith('/' + key));
        } else throw Error("HERE");
      }
    }
    if (!tc) throw Error(`Can't find ${resourceType}.${key} in ${JSON.stringify(schemaObject, null, 2)}`);
    let te = null;
    let valueExpr = tc.valueExpr;
    const Pfhirshex = "http://hl7.org/fhir/shape/";
    const listOfStem = Pfhirshex + "OneOrMore_";
    if (typeof valueExpr === "string" && valueExpr.startsWith(listOfStem)) {
      valueExpr = Pfhirshex + valueExpr.substr(listOfStem.length);
    }
    if (typeof valueExpr === "object") {
      if (valueExpr.type === "ShapeAnd") {
        te = valueExpr.shapeExprs[0];
      } else if (valueExpr.type === "ShapeOr") {
        return [valueExpr, resourceType];
      } else if (valueExpr.type === "NodeConstraint") {
        return [valueExpr, resourceType];
      } else if (valueExpr.type === "Shape") { // nested shapes shows up only in nested schemas
        return [valueExpr, resourceType];
      } else throw Error("HERE");
    } else if (typeof valueExpr === "string") {
      if (!valueExpr.startsWith(NS_fhir)) throw Error(`unexpected valueExpr in ${tc}`);
      te = valueExpr;
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
      let v = null
      if (Array.isArray(e)) {
        throw Error(`Problem: ${key} has a list in a list`)
      } else if (typeof e === 'object') {
        v = this.processFhirObject(e, schemaObject, resourceType)
      } else {
        v = this.toFhirValue(e, schemaObject, resourceType)
      }
      if (this.opts.axes.c) {
        return v // handled by the @context's "@container": "@list"
      }
      if (typeof v === "string")
        throw Error(`Can't add index to RDF literal \"${v}\" for ${resourceType}.${key}`)
      if (typeof v !== 'object')
        throw Error(`Can't add index to \"${JSON.stringify(v)}\" for ${resourceType}.${key}`)
      if ("@value" in v)
        throw Error(`Can't add index to RDF literal \"${JSON.stringify(v)}\" for ${resourceType}.${key}`)
      v['index'] = i
      return v
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
  toFhirValue(jsonValue, schemaObject, nestType) {
    let typedValue = null;

    const [nestScalar, t] = this.lookupNestedObject(schemaObject, nestType, "value");
    if (nestScalar.type === "NodeConstraint") {
      typedValue = {
        "@type": nestScalar.datatype.replace(/^http:\/\/www\.w3\.org\/2001\/XMLSchema#/, "xsd:"),
        "@value": jsonValue,
      };
    } else if (nestScalar.type === "ShapeOr") {
      const ut = nestScalar.shapeExprs.map(
          nc => UnionedTypes[nc.datatype.substr(NS_xsd.length)]
      ).find(
          t => t.pattern.test(jsonValue)
      );
      typedValue = { '@type': ut.dt, '@value': jsonValue };
    } else {
      throw new Error(`deal with toFhirValue(${JSON.stringify(jsonValue)}, ${JSON.stringify(schemaObject)}, ${JSON.stringify(nestType)})`);
    }
    return this.opts.axes.h ? typedValue : { 'value': typedValue };
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
