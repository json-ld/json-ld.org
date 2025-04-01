import assert from 'node:assert/strict';

const baseUri = 'http://localhost:8788';

(async () => {
  // test json-ld media type
  const url = `${baseUri}/contexts/event.jsonld`;
  const resp = await fetch(url);
  assert(resp.headers.get('Content-Type') === 'application/ld+json',
    `Content-Type for ${url} should be application/ld+json.`);
})();

(async () => {
  // test that /playground-dev redirects to /playground
  const url = `${baseUri}/playground-dev`;
  const resp = await fetch(url, {redirect: 'manual'});
  assert(resp.status === 302,
    `Should be a 302 redirect.`);
  const location = resp.headers.get('Location');
  assert(location === '/playground',
    `Old /playground-dev should redirect to /playground`);
})();

(async () => {
  // test json-ld media type on URLs without extensions
  const urls = [
    `${baseUri}/contexts/event`,
    `${baseUri}/contexts/person`,
    `${baseUri}/contexts/place`,
    `${baseUri}/contexts/recipe`,
  ];
  Promise.all(urls.map(async (url) => {
    const resp = await fetch(url, {redirect: 'manual'});
    const contentType = resp.headers.get('Content-Type');
    assert(contentType === 'application/ld+json',
      `Content-Type for ${url} should be application/ld+json; got ${contentType}.`);
    const cors = resp.headers.get('Access-Control-Allow-Origin');
    assert(cors === '"*"',
      `Header 'Access-Control-Allow-Origin' should be '*'; got ${cors}.`);
  }));
})();

(async () => {
  // test json-ld media type
  const urls = [
    `${baseUri}/contexts/event`,
    `${baseUri}/contexts/person`,
    `${baseUri}/contexts/place`,
    `${baseUri}/contexts/recipe`,
  ];
  Promise.all(urls.map(async (url) => {
    const resp = await fetch(url, {redirect: 'manual'});
    const contentType = resp.headers.get('Content-Type');
    assert(contentType === 'application/ld+json',
      `Content-Type for ${url} should be application/ld+json; got ${contentType}.`);
    const cors = resp.headers.get('Access-Control-Allow-Origin');
    assert(cors === '"*"',
      `Header 'Access-Control-Allow-Origin' should be '*'; got ${cors}.`);
  }));
})();

(async () => {
  // test media type for `*.jldte`
  const url = `${baseUri}/test-suite/tests/remote-doc-0003-in.jldt`;
  const resp = await fetch(url);
  const contentType = resp.headers.get('Content-Type');
  assert(contentType === 'application/jldTest+json',
    `Content-Type for ${url} should be application/jldTest+json; got ${contentType}.`);
})();

(async () => {
  // test media type for `*.jldte`
  const url = `${baseUri}/test-suite/tests/remote-doc-0004-in.jldte`;
  const resp = await fetch(url);
  const contentType = resp.headers.get('Content-Type');
  assert(contentType === 'application/jldTest',
    `Content-Type for ${url} should be application/jldTest; got ${contentType}.`);
})();
