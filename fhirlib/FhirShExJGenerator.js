const {FhirRdfModelGenerator, PropertyMapping, ModelVisitor} = require('./FhirRdfModelGenerator');
const Prefixes = require('./Prefixes');

class FhirShExJGenerator extends ModelVisitor {

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

  static INDEX = {
    type: "TripleConstraint",
    predicate: "http://hl7.org/fhir/index",
    valueExpr: { type: "NodeConstraint", datatype: "http://www.w3.org/2001/XMLSchema#integer" },
    min: 0, max: 1 // TODO <- remove max
  };

  constructor(structureMap, datatypeMap) {
    super(structureMap, datatypeMap);
    this.schema = JSON.parse(JSON.stringify(FhirShExJGenerator.SCHEMA));
    this.teListStack = [];
    this.shapeStack = [];
    // this.references = new Map();
  }

  genShExJ (target, config) {
    const modelGenerator = new FhirRdfModelGenerator(this.structureMap, this.datatypeMap);

    this.pushShape(Prefixes.fhirshex + target);
    this.addTripleConstraint(Prefixes.rdf + 'type', {
      "type": "NodeConstraint",
      "values": [Prefixes.fhir + target]
    });
    modelGenerator.visitResource(target.toLowerCase(), this, config);
    // this.structureMap.entries.forEach(
    //   entry => { if (this.skip.indexOf(entry)) modelGenerator.visitResource(target, this, config); }
    // );
    this.popShape();
    return this.schema;
  }

  enter (propertyMapping) {
    this.addTripleConstraint(propertyMapping.predicate, Prefixes.fhirshex + propertyMapping.predicate.substr(Prefixes.fhir.length));
    this.pushShape(Prefixes.fhirshex + propertyMapping.element.id);
  }
  scalar (propertyMapping) {
    this.addTripleConstraint(propertyMapping.predicate, propertyMapping.type); // e.g. http://www.w3.org/2001/XMLSchema#string"
  }

  complex (propertyMapping) {
    this.addTripleConstraint(propertyMapping.predicate, Prefixes.fhirshex + propertyMapping.type); // e.g. MedicationRequest.dose.dosageInstruction
  }

  exit (propertyMapping) {
    this.popShape(propertyMapping.type);
  }

  pushShape (name) {
    const newShape = {
      type: "Shape",
      id: name,
    };
    this.teListStack.unshift([]);
    this.schema.shapes.push(newShape);
    this.shapeStack.push(newShape);
  }
 
  popShape (name) {
    const teList = this.teListStack.shift();
    if (teList.length === 0)
      throw new Error(`Unexpected 0-length TE list when serializing, um, something?`);
    this.shapeStack.pop().expression = teList.length === 1
      ? teList[0]
      : {
        type: "EachOf",
        expressions: teList
      };
  }

  addTripleConstraint(predicate, valueExpr) {
    this.teListStack[0].push({
      type: "TripleConstraint",
      predicate: predicate,
      valueExpr: valueExpr,
    });
  }
};

if (typeof module !== 'undefined')
  module.exports = FhirShExJGenerator;
