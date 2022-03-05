const { DefinitionLoader } = require('./DefinitionLoader');
const { DefinitionIndex } = require('./DefinitionIndex');
const { BundleDefinitionLoader } = require('./BundleDefinitionLoader');
const Fs = require('fs');
const Path = require('path');

class FshDefinitionLoader extends DefinitionLoader {
  constructor(fshFile, ...definitions) {
    super();
    this.defs = new DefinitionIndex(definitions);
    const parsed = Path.parse(fshFile);
    this.fshDir = parsed.dir;
    this.start = parsed.base;
  }

  async getStart () { return Fs.promises.readFile(Path.join(this.fshDir, this.start), 'utf-8'); }

  getStructureDefinitionByName (target) {
    console.log(target); process.exit();
    return this.defs.getStructureDefinitionByName(target);
  }

  getCodesystemByUrl (target) {
    console.log(target); process.exit();
    return this.defs.getCodesystemByUrl(target);
  }
}

if (typeof module !== 'undefined')
  module.exports = {FshDefinitionLoader};
