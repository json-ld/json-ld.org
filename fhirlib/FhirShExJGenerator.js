const {FhirRdfModelGenerator, PropertyMapping, ModelVisitor} = require('./FhirRdfModelGenerator');
const Prefixes = require('./Prefixes');

const GEN_SHEXJ_STEM = 'http://hl7.org/fhir/StructureDefinition/';
const CODE_SYSTEM_STEM = 'http://hl7.org/fhir/CodeSystem/';
const VALUE_SET_STEM = 'http://hl7.org/fhir/ValueSet/';

/**
 * Leverage a FhirRdfModelGenerator to traverse StructureDefinitions and generate equivalent ShExJ.
 */
class FhirShExJGenerator extends ModelVisitor {

  // prototype for generated schema.
  static SCHEMA = {
    type: "Schema",
    start: {
      type: "ShapeAnd",
      shapeExprs: [
        { type: "Shape" }, // replace me with e.g. Prefixes.fhirshex + "MedicationRequest"
        {
          type: "Shape",
          expression: {
            type: "TripleConstraint",
            predicate: "http://hl7.org/fhir/nodeRole",
            valueExpr: {
              type: "NodeConstraint",
              values: [
                "http://hl7.org/fhir/treeRoot"
              ]
            }
          }
        }
      ]
    },
    shapes: [
    ]
  };

  // prototype for fhir:index list emulations.
  static INDEX = {
    type: "TripleConstraint",
    predicate: "http://hl7.org/fhir/index",
    valueExpr: { type: "NodeConstraint", datatype: "http://www.w3.org/2001/XMLSchema#integer" },
    min: 0, max: 1 // TODO <- remove max
  };

  static PARENT_TYPES = ['Resource'];

  static ResourcesThatNeedALink = ["Reference"];

  constructor (resources, datatypes, valuesets, config = {}) {
    super(resources, datatypes, valuesets);
    this.config = config;
    // make a fresh copy of the prototype schema.
    this.schema = JSON.parse(JSON.stringify(FhirShExJGenerator.SCHEMA));
    // conjunctions of TripleExpressions to add to current shape.
    this.teListStack = [];
    // shift in nested shape on genShape and enter. unshift on exit and when done in genShape.
    this.shapeStack = [];
    // list of top-level shape labels added to schema. differs from shapes.map(se => se.id) if nested shapes get top-level entries.
    this.added = [];
    // walk StructureDefinition, calling enter, scalar, complex, exit.
    this.modelGenerator = new FhirRdfModelGenerator(this.resources, this.datatypes, this.valuesets);
  }

  genShExJ (skip = []) {
    const sources = [this.resources, this.datatypes, this.valuesets];
    const generated = sources.reduce((generated, source) => {
      return source.entry.reduce((generated, entry) => {
        const url = entry.fullUrl;
        const genMe = url.startsWith(GEN_SHEXJ_STEM)
              ? url.substr(GEN_SHEXJ_STEM.length)
              : url.startsWith(VALUE_SET_STEM)
              ? url.substr(VALUE_SET_STEM.length)
              : url.substr(CODE_SYSTEM_STEM.length);
        try {
          if (skip.indexOf(genMe) !== -1)
            return generated;

          source.id === 'valuesets'
            ? this.genValueset(genMe, this.config)
            : this.genShape(genMe, true, this.config);
          return generated.concat(genMe);
        } catch (e) {
          console.warn("error trying to genShExJ:" + e.stack);
          throw e; // what does jest do with this exception?
        }
      }, generated);
    }, [])
    const allTypesLabel = Prefixes.fhirvs + 'all-types';
    generated.push('all-types');
    this.genAllTypes(allTypesLabel, this.config);
    return this.schema;
  }

  /**
   * Generate a Shape for target. This may entail creating nested shapes.
   * @param target shape label for generates Shape.
   * @param config control predicates and lists in RDF model.
   * @returns {FhirShExJGenerator} this.
   */
  genShape (target, root, generatorConfig = this.config) {
    const isParent = FhirShExJGenerator.PARENT_TYPES.indexOf(target) === -1;
    const label = Prefixes.fhirshex + target;
    this.added.push(label);
    this.pushShape(label, isParent);
    if (target in this.resources._index) {
      if (isParent) {
        this.add(this.makeTripleConstraint(
          Prefixes.rdf + 'type',
          { "type": "NodeConstraint", "values": [Prefixes.fhir + target] },
          null));
        if (root) {
          this.add(this.makeTripleConstraint(
            Prefixes.fhir + 'nodeRole',
            { "type": "NodeConstraint", "values": ["http://hl7.org/fhir/treeRoot"] },
            {min: 0, max: 1}
          ));
        }
      } else {
        this.add(this.makeTripleConstraint(
          Prefixes.rdf + 'type',
          undefined,
          {min: 1, max: -1}
        ));
      }
    }
    if ("addTypesTo" in this.config && this.config.addTypesTo.indexOf(target) !== -1) {
      this.add(this.makeTripleConstraint(
          Prefixes.rdf + 'type',
          { "type": "NodeConstraint", "nodeKind": 'nonliteral' },
          {min: 0, max: 1}
      ));
    }
    if (FhirShExJGenerator.ResourcesThatNeedALink.indexOf(target) !== -1) {
      this.add(this.makeTripleConstraint(
        Prefixes.fhir + 'link',
        { "type": "NodeConstraint", "nodeKind": "iri" },
        {min: 0, max: 1}
      ));
    }
    this.modelGenerator.visitResource(target, this, generatorConfig);
    // this.resources._index.entries.forEach(
    //   entry => { if (this.skip.indexOf(entry)) modelGenerator.visitResource(target, this, generatorConfig); }
    // );
    this.popShape(target);
    return this;
  }

  enter (propertyMapping) {
    this.add(this.makeTripleConstraint(
      propertyMapping.predicate,
      Prefixes.fhirshex + propertyMapping.predicate.substr(Prefixes.fhir.length),
      this.makeCard(propertyMapping.element.min, propertyMapping.element.max)
    ));
    this.pushShape(Prefixes.fhirshex + propertyMapping.element.id, true); // TODO: would break if nested *inside* a DomainResource.
  }

  element (propertyMappings) {
    const valueExprs = propertyMappings.reduce((acc, propertyMapping) => {
      let valueExpr;
      if (propertyMapping.isScalar) {
        valueExpr = propertyMapping.type; // e.g. http://www.w3.org/2001/XMLSchema#string"
      } else {
        valueExpr = Prefixes.fhirshex + propertyMapping.type;
        if (propertyMapping.binding && propertyMapping.binding.strength === 'required') {
          const [valueSet, version] = propertyMapping.binding.valueSet.split(/\|/);
          const annotations = this.config.addValueSetVersionAnnotation && version
                ? {
                  "annotations": [{
                    "type": "Annotation",
                    "predicate": "http://hl7.org/fhir/version",
                    "object": {"value": version}
                  }]
                }
                : {};
          const expression = Object.assign(
            {
              type: "TripleConstraint",
              predicate: Prefixes.fhir + 'value',
              valueExpr: valueSet
            },
            annotations
          );
          valueExpr = {
            type: "ShapeAnd",
            shapeExprs: [valueExpr, {type: "Shape", expression}]
          };
        }
      }
      return acc.concat([this.makeTripleConstraint(
        propertyMapping.predicate,
        valueExpr,
        null
      )]);
    }, []);

    const possibleDisjunction = Object.assign(
      valueExprs.length > 1
        ? {
          type: "OneOf",
          expressions: valueExprs
        }
      : valueExprs[0],
      this.makeCard(propertyMappings[0].element.min, propertyMappings[0].element.max)
    );
    this.add(possibleDisjunction); // e.g. MedicationRequest.dose.dosageInstruction
  }

  exit (propertyMapping) {
    this.popShape(propertyMapping.type);
  }

  pushShape (name, isClosed) {
    const newShape = Object.assign({
      type: "Shape",
      id: name,
    }, isClosed
    ? {  closed: true }
    : {}
    );
    this.teListStack.unshift([]);
    this.schema.shapes.push(newShape);
    this.shapeStack.push(newShape);
  }

  popShape (name) {
    const teList = this.teListStack.shift();
    if (teList.length === 0)
      throw new Error(`Unexpected 0-length TE list when serializing, um, something?`);
    if (this.config.oloIndexes && FhirShExJGenerator.PARENT_TYPES.indexOf(name) === -1) {
      teList.push(FhirShExJGenerator.INDEX);
    }
    this.shapeStack.pop().expression = teList.length === 1
      ? teList[0]
      : {
        type: "EachOf",
        expressions: teList
      };
  }

  makeCard(minP, maxP) {
    const min = minP === undefined ? 1 : minP;
    const max = maxP === undefined
        ? 1
        : maxP === '*'
        ? -1
        : parseInt(maxP);
    return min === 1 && max === 1
        ? {}
        : {min, max};
  }

  makeTripleConstraint(predicate, valueExpr, cardObj = {}) {
    return Object.assign({
      type: "TripleConstraint",
      predicate: predicate,
    },
        valueExpr ?
            { valueExpr: valueExpr }
            : {},
        cardObj);
  }

  add(te) {
    this.teListStack[0].push(te)
  }

  /**
   * Generate a NodeConstraint for target, pulling values from FHIR valuesets and ConceptMaps.
   * @param target shape label for generated NodeConstraint.
   * @param config control predicates and lists in RDF model.
   * @returns {FhirShExJGenerator}
   */
  genValueset (target, generatorConfig = this.config) {
    const label = Prefixes.fhirvs + target;
    let map;
    if (target === "root") {
      return;
    } if (target in this.valuesets._index) {
      map = this.valuesets._index;
    } else {
      throw new Error(`Key ${target} not found in ${Object.keys(this.valuesets._index)}`);
    }
    const resourceDef = map[target];
    if ("baseDefinition" in resourceDef && !(resourceDef.baseDefinition.startsWith(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT)))
      throw new Error(`Don't know where to look for base structure ${resourceDef.baseDefinition}`);

    if ("baseDefinition" in resourceDef) {
      const recursionTarget = resourceDef.baseDefinition.substr(FhirRdfModelGenerator.STRUCTURE_DEFN_ROOT.length);
      this.visitElement(recursionTarget, visitor, generatorConfig); // Get content model from base type
    }

    let sourceValues;
    if ('concept' in resourceDef) {
      sourceValues = resourceDef.concept;
    } else if ('compose' in resourceDef) {
      const includedConcepts = resourceDef.compose.include.find(i => 'concept' in i);
      if (includedConcepts)
        sourceValues = includedConcepts.concept;
      else
        return this; // can't generate. make EXTERNAL?
    } else {
      return this; // can't generate. make EXTERNAL?
    }
    const values = [];
    this.added.push(label);
    this.schema.shapes.push({
      type: "NodeConstraint",
      id: label,
      values: values
    });

    // Walk differential elements
    sourceValues.forEach(elt => {
      values.push({ value: elt.code });
    });
    return this;
  }

  /**
   *
   * @param label shape label for generated NodeConstraint.
   * @param config control predicates and lists in RDF model.
   * @returns {FhirShExJGenerator}
   */
  genAllTypes (label, generatorConfig = this.config) {
    this.schema.shapes.push({
      type: "NodeConstraint",
      id: label,
      values: this.added.map(label => ({ value: label.substr(label.lastIndexOf('/') + 1) }))
    });
    this.schema["@context"] = "http://www.w3.org/ns/shex.jsonld";
    return this;
  }
};

if (typeof module !== 'undefined')
  module.exports = FhirShExJGenerator;
