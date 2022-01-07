function indexBundle (bundle) {
  if (!('_index' in bundle)) {
    bundle._index = bundle.entry.reduce((acc, entry) => {
      acc[entry.resource.id] = entry.resource;
      return acc;
    }, {});
  }
  return bundle;
}

if (typeof module !== 'undefined')
  module.exports = {indexBundle};
