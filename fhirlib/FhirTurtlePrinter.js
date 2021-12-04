/**
 *
 */
const TurtleParser = require('./TurtleParser');
const P = require('./Prefixes');

class Printer {
  constructor(structureMap, datatypeMap) {
    this.structureMap = structureMap;
    this.datatypeMap = datatypeMap;
  }
  print(resource, config) {
    const s = resource.store;
    const roots = s.getQuads(null, P.rdf + 'type', P.fhir + '')
  }
}

if (typeof module !== 'undefined')
  module.exports = {Printer};
