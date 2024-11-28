const drafts = [
  'CG-FINAL',
  'CR',
  'ED',
  'FCGS',
  'PR',
  'REC',
  'WD',
  'latest'
];

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('404.html');
  eleventyConfig.addPassthroughCopy('.htaccess');
  eleventyConfig.addPassthroughCopy('LICENSE.md');
  eleventyConfig.addPassthroughCopy('benchmarks/**/*.{jsonld,nq,md}');
  eleventyConfig.addPassthroughCopy('contexts/**/*.{htaccess,html,jsonld}');
  eleventyConfig.addPassthroughCopy('contexts/{event,person,place,recipe,remote-context}');
  eleventyConfig.addPassthroughCopy('examples/**/*.{html,ttl,txt,json}');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('fonts');
  eleventyConfig.addPassthroughCopy('images/**/*.{htaccess,png,svg,xcf}');
  eleventyConfig.addPassthroughCopy('ns/**/*.{html,jsonld}');
  eleventyConfig.addPassthroughCopy('playground/**/*.{css,php,js}');
  eleventyConfig.addPassthroughCopy('presentations');
  eleventyConfig.addPassthroughCopy('schemas/**/*.json');
  eleventyConfig.addPassthroughCopy('site.css');
  eleventyConfig.addPassthroughCopy('spec/LICENSE.md');
  for(const draft of drafts) {
    eleventyConfig.addPassthroughCopy(`spec/${draft}`);
  }
  eleventyConfig.addPassthroughCopy('static');
  eleventyConfig.addPassthroughCopy('test-suite');
  eleventyConfig.addPassthroughCopy('utils');
  eleventyConfig.ignores.add('CONTRIBUTING.md');
  eleventyConfig.ignores.add('LICENSE.md');
  eleventyConfig.ignores.add('README.md');
  eleventyConfig.ignores.add('benchmarks/README.md');
  eleventyConfig.ignores.add('contexts/person.html');
  eleventyConfig.ignores.add('examples');
  eleventyConfig.ignores.add('images/README.md');
  eleventyConfig.ignores.add('minutes/**/*');
  eleventyConfig.ignores.add('ns/json-ld.html');
  eleventyConfig.ignores.add('playground/dev/README.md');
  eleventyConfig.ignores.add('presentations');
  eleventyConfig.ignores.add('scripts');
  eleventyConfig.ignores.add('spec/tools');
  eleventyConfig.ignores.add('spec/LICENSE.md');
  for(const draft of drafts) {
    eleventyConfig.ignores.add(`spec/${draft}`);
  }
  eleventyConfig.ignores.add('test-suite');
};
