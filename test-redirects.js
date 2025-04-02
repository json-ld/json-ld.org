import assert from 'node:assert/strict';

const baseUri = 'http://localhost:8788';

// Test _headers
(async () => {
  // test json-ld media type
  const url = `${baseUri}/contexts/event.jsonld`;
  const resp = await fetch(url);
  assert(resp.headers.get('Content-Type') === 'application/ld+json',
    `Content-Type for ${url} should be application/ld+json.`);
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

(async () => {
  // test link headers
  const urlsToLinkHeaderValues = {
    '/test-suite/tests/remote-doc-0009-in.jsonld':
      `<remote-doc-0009-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"`,
    '/test-suite/tests/remote-doc-0010-in.json':
      `<remote-doc-0010-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"`,
    '/test-suite/tests/remote-doc-0011-in.jldt':
      `<remote-doc-0011-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"`,
    '/test-suite/tests/remote-doc-0012-in.json':
      `<remote-doc-0012-context1.jsonld>; rel="http://www.w3.org/ns/json-ld#context", <remote-doc-0012-context2.jsonld>; rel="http://www.w3.org/ns/json-ld#context"`
  };
  Promise.all(Object.entries(urlsToLinkHeaderValues)
    .map(async ([absoultePath, intendedHeaderValue]) => {
      const url = `${baseUri}${absoultePath}`;
      const resp = await fetch(url);
      const actualLinkValue = resp.headers.get('Link');
      assert(actualLinkValue === intendedHeaderValue,
        `Link header for ${url} should be ${intendedHeaderValue}; got ${actualLinkValue}.`);
    })
  );
})();

// Test _redirects
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
