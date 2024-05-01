// json-ld.org playground proxy
//
// details:
// - Basic proxy for use with the json-ld.org playground.
// - Built for deployment using Cloudflare Pages Functions API
//   - https://developers.cloudflare.com/pages/functions/
// - Only handle GET requests.
// - Only designed to be used by the playground, no CORS support.
// - Only handle requests for 'http:' URLs.
// - Short timeout enough for expected development use cases.
// - Only support JSON-LD and JSON content types for target response.
// - Not intended to be very robust (but improvements welcome).
//
// usage:
// - GET /playground/proxy?url={encoded-url}
// - Proxy errors have JSON content and a
//   'X-JSON-LD-Playground-Proxy-Status' header.

const RESPONSE_HEADER = 'X-JSON-LD-Playground-Proxy-Status';

function makeError({error}) {
  return Response.json({error}, {
    status: 400,
    headers: {
      [RESPONSE_HEADER]: '400'
    }
  });
}

export async function onRequestGet(context) {
  const request = context.request;
  try {
    const requestUrl = new URL(request.url);
    const targetUrl = new URL(requestUrl.searchParams.get('url'));
    // check self request
    if(targetUrl.host === requestUrl.host) {
      return makeError({error: 'self request'});
    }
    // check url protocol
    if(targetUrl.protocol !== 'http:') {
      return makeError({error: 'unsupported URL protocol'});
    }
    // make similar request with new target url
    const req = new Request(targetUrl, request);
    const res = await fetch(req, {
      redirect: 'follow',
      // fail for long requests
      signal: AbortSignal.timeout(3000)
    });
    // check return type is JSON-LD or JSON
    const ct = res.headers.get('content-type');
    if(!(ct === 'application/ld+json' || ct === 'application/json')) {
      return makeError({error: 'unsupported response content type'});
    }
    // check if remote seems to be the proxy itself
    if(res.headers.has(RESPONSE_HEADER)) {
      return makeError({error: 'playground proxy response found'});
    }
    return res;
  } catch(e) {
    // special case timeout error
    if(e.name === 'TimeoutError') {
      return makeError({error: 'timeout'});
    }
    // fallback error
    return makeError({error: 'bad request'});
  }
}
