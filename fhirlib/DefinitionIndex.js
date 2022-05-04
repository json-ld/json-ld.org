class DefinitionIndex {
  constructor () {
    this.index = new Map();
  }

  add (id, entry, where) {
    if (this.index.has(id)) {
      const old = this.index.get(id)
      console.warn(`duplicate ${id}
old: ${old.entry.resourceType} ${old.entry.kind} at ${old.where},
new: ${entry.resourceType} ${entry.kind} at ${where}`);
    }
    this.index.set(id, {where, entry});
  }

  get (target) {
    return this.index.has(target)
        ? this.index.get(target).entry
        : undefined;
  }
}

if (typeof module !== 'undefined')
  module.exports = {DefinitionIndex};
