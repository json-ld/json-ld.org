/**
 * abstract DefinitionLoader for FhirRdfModelGenerator
 * This doesn't do anything more than define what would be a TypeScript interface.
 */
class DefinitionLoader {

  async getStructureDefinitionByName (target) { throw new Error(`DefinitionLoader.getStructureDefinitionByName(${target}) must be overloaded`); }
  async getCodesystemByUrl (target) { throw new Error(`DefinitionLoader.getCodesystemByUrl(${target}) must be overloaded`); }
}

if (typeof module !== 'undefined')
  module.exports = {DefinitionLoader};
