json-ld.org
===========

Introduction
------------

[![Join the chat at https://gitter.im/json-ld/json-ld.org](https://badges.gitter.im/json-ld/json-ld.org.svg)](https://gitter.im/json-ld/json-ld.org)

This is the source for the https://json-ld.org/ website.

JSON-LD (JavaScript Object Notation for Linking Data) is a lightweight Linked
Data format. It is easy for humans to read and write. It is easy for machines
to parse and generate. It is based on the already successful JSON format and
provides a way to help JSON data interoperate at Web-scale. If you are already
familiar with JSON, writing JSON-LD is very easy. There is a smooth migration
path from the JSON you use today, to the JSON-LD you will use in the future.
These properties make JSON-LD an ideal Linked Data interchange language for
JavaScript environments, Web services, and unstructured databases such as
CouchDB and MongoDB.

If you are already using JSON-LD, add yourself to the [list of users][] in our wiki.


A Simple Example
----------------

A simple example of a JSON object with added semantics::

```json
{
  "@context": "https://json-ld.org/contexts/person.jsonld",
  "@id": "http://dbpedia.org/resource/John_Lennon",
  "name": "John Lennon",
  "born": "1940-10-09",
  "spouse": "http://dbpedia.org/resource/Cynthia_Lennon"
}
```

The example above describes a person whose name is John Lennon. The difference
between regular JSON and JSON-LD is that the JSON-LD object above uniquely
identifies itself on the Web and can be used, without introducing ambiguity,
across every Web site, Web services and databases in operation today.

The Playground
--------------

If you would like to play around with JSON-LD markup, you may do so here:

https://json-ld.org/playground/

The Specifications
------------------

If you are a developer, you may be interested in the official JSON-LD W3C
specifications:

* [JSON-LD 1.1 - A JSON-based Serialization for Linked Data][]
* [JSON-LD 1.1 Processing Algorithms and API][]
* [JSON-LD 1.1 Framing][]

A list of all previous specification drafts is also available.

https://json-ld.org/spec/

Website Development
-------------------

- This site is published using [Eleventy][].
- The site is deployed using [Cloudflare Pages][].
- The [playground][] has a special proxy to handle `http:` URLs.

To develop this website locally:

```sh
# install dependencies
npm i
# to just build the static files to `_site/`
npm run build
# to rebuild the files on changes
npm run watch
# to serve `_site/` with Cloudflare Pages feature support
npm run pages # visit http://localhost:8788/
```

Additionally, if you want to use or test the playground `http:` proxy, also run
the [Wrangler][] server to emulate the [Cloudflare Pages Functions][] code:

```sh
npm run dev
```

Editor Development
------------------

The new Playground is build using [CodeMirror][] 6 and is integrated into the
surrounding UI using [petite-vue][].

* `playground/next/index.html` has the HTML and petite-vue markup-level code
* `playground/next/editor.mjs` contains the JS for setting up CodeMirror and
  attaching it to the DOM via petite-vue

The `npm run build:editor` command uses [Rollup][] to build the final JS bundle
at `playground/next/editor.bundle.js` which contains the browser ready JS code.

Website Analytics
-----------------

Google Analytics has been used on this site since 2013. There are two GA
identifiers in use:

* UA-40462488-1 for `primer/`, `spec/`, and `requirements/`
* UA-42886053-1 for everything else (per the default)

The default code can be overridden by setting `ga` to a specific number (ex:
`40462488`) in the page's front matter.

[Cloudflare Pages Functions]: https://developers.cloudflare.com/pages/functions/
[Cloudflare Pages]: https://pages.cloudflare.com/
[Eleventy]: https://www.11ty.dev/
[JSON-LD 1.1 - A JSON-based Serialization for Linked Data]: http://www.w3.org/TR/json-ld/
[JSON-LD 1.1 Framing]: https://www.w3.org/TR/json-ld-framing/
[JSON-LD 1.1 Processing Algorithms and API]: https://www.w3.org/TR/json-ld-api/
[Wrangler]: https://developers.cloudflare.com/workers/wrangler/
[list of users]: https://github.com/json-ld/json-ld.org/wiki/Users-of-JSON-LD
[playground]: https://json-ld.org/playground/
[CodeMirror]: https://codemirror.net/
[petite-vue]: https://github.com/vuejs/petite-vue
[Rollup]: https://rollupjs.org/
