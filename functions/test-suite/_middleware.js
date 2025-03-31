const typeToExt = {
  "text/turtle": "ttl",
  "application/ld+json": "jsonld"
};

export async function onRequest(context) {
  try {
    const accept = context.request.headers.get('Accept');

    // if we have a mapping for this extension, send it. Otherwise fall through.
    if(Object.keys(typeToExt).indexOf(accept) > -1) {
      const ext = typeToExt[accept] || `html`;
      const rewrittenUrl = context.request.url + '.' + ext;
      const asset = await context.env.ASSETS.fetch(rewrittenUrl);
      const response = new Response(asset.body, asset);
      return response;
    }
    return context.next();
  } catch (err) {
    return new Response(`${err.message}\n${err.stack}`, { status: 500 });
  }
}
