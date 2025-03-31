// development host for playground proxy
const PLAYGROUND_PROXY_HOST = 'http://localhost:8788';

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
  eleventyConfig.addPassthroughCopy('_headers');
  eleventyConfig.addPassthroughCopy('_redirects');
  eleventyConfig.addPassthroughCopy('benchmarks/**/*.{jsonld,nq,md}');
  eleventyConfig.addPassthroughCopy('contexts/**/*.{htaccess,html,jsonld}');
  eleventyConfig.addPassthroughCopy('contexts/{event,person,place,recipe,remote-context}');
  eleventyConfig.addPassthroughCopy('examples/**/*.{html,ttl,txt,json}');
  eleventyConfig.addPassthroughCopy('favicon.ico');
  eleventyConfig.addPassthroughCopy('fonts');
  eleventyConfig.addPassthroughCopy('functions/**/*.js');
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
  eleventyConfig.ignores.add('CONTRIBUTING.md');
  eleventyConfig.ignores.add('LICENSE.md');
  eleventyConfig.ignores.add('README.md');
  eleventyConfig.ignores.add('benchmarks/README.md');
  eleventyConfig.ignores.add('contexts/person.html');
  eleventyConfig.ignores.add('examples');
  eleventyConfig.ignores.add('images/Makefile');
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

  // setup development proxy to cloudflare pages function server
  if(process.env.ELEVENTY_RUN_MODE === 'serve') {
    eleventyConfig.setServerOptions({
      onRequest: {
        '/playground/proxy': playgroundProxy
      }
    });
  }
};

// proxy to worker proxy
async function playgroundProxy({url}) {
  const targetUrl = url.searchParams.get('url');
  // eleventy only provides the URL
  // approximate what the live playground does
  const search = new URLSearchParams();
  search.set('url', targetUrl);
  const proxyUrl =
    new URL(`${PLAYGROUND_PROXY_HOST}/playground/proxy?${search}`);
  const res = await fetch(proxyUrl, {
    headers: {
      'Accept': 'application/ld+json, application/json'
    }
  });
  // create headers object and filter properties
  // suffient for the site development purposes
  const headers = Object.fromEntries(
    Array.from(res.headers.entries()).filter(
      v => !['content-length', 'content-encoding'].includes(v[0])));
  return {
    status: res.status,
    headers,
    body: await res.text()
  }
}
