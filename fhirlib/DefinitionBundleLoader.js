const { DefinitionIndex } = require('./DefinitionIndex');

class DefinitionBundleLoader {
  constructor() {
    this.structureDefinitions = new DefinitionIndex();
    this.codesystemUrls = new DefinitionIndex();

    for (let argNo = 0; argNo < arguments.length; ++argNo) {
      const arg = arguments[argNo];
      const entries = arg.resourceType === "Bundle"
          ? arg.entry.map(e => e.resource)
          : Array.isArray(arg)
          ? arg
          : [arg];
      for (let entryNo = 0; entryNo < entries.length; ++entryNo) {
        const where = `[${argNo}][${entryNo}]`; // make it easy to debug duplicate defintions
        this.indexDefinition(entries[entryNo], where);
      }
    }
  }

  indexDefinition (entry, where) {
    switch (entry.resourceType) {
      case 'CodeSystem':
        this.codesystemUrls.add(entry.url, entry, where);
        break;
      case 'ValueSet':
        this.structureDefinitions.add(entry.id, entry, where);
        break;
      case 'CapabilityStatement':
      case 'CompartmentDefinition':
      case 'OperationDefinition':
        break;
      case 'StructureDefinition':
        this.structureDefinitions.add(entry.id, entry, where);
        break;
      default:
        throw Errogr(`what's a ${entry.resourceType}`);
    }
  }

  getStructureDefinitionByName (target) { return this.structureDefinitions.get(target); }
  getCodesystemByUrl (target) { return this.codesystemUrls.get(target); }
}

if (typeof module !== 'undefined')
  module.exports = {DefinitionBundleLoader};
