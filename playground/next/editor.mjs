/* globals: jsonld */

import {autocompletion, completeFromList} from '@codemirror/autocomplete';
import {EditorView, basicSetup} from 'codemirror';
import {createApp} from "petite-vue";
import {EditorState} from '@codemirror/state'
import {indentWithTab} from '@codemirror/commands';
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {keymap} from '@codemirror/view';
import {linter} from '@codemirror/lint';

// Setup JSON-LD documentLoader
const xhrDocumentLoader = jsonld.documentLoaders.xhr();
// FIXME: add UI to let users control and set context mapping
jsonld.documentLoader = function(url) {
  // rewrite URLs that we know have secure JSON-LD Contexts
  if(url === 'http://schema.org/' || url === 'http://schema.org') {
    url = 'https://schema.org/';
  }

  // if a non-HTTPS URL, use the proxy since we run in HTTPS only mode
  if(!url.startsWith('https://')) {
    url = [
      location.protocol,
      '//',
      location.host,
      // NOTE: using hard-coded path so file can be shared with dev page
      //location.pathname,
      '/playground/',
      'proxy?url=',
      url
    ].join('');
  }

  return xhrDocumentLoader(url);
};

const jsonLdAtTerms = [
  { label: "@context", type: "keyword", info: "Defines the JSON-LD context" },
  { label: "@id", type: "keyword", info: "Specifies the unique identifier of an entity" },
  { label: "@type", type: "keyword", info: "Defines the type of an entity" },
  { label: "@value", type: "keyword", info: "Represents the value of a node" },
  { label: "@language", type: "keyword", info: "Specifies the language of a string value" },
  { label: "@graph", type: "keyword", info: "Represents a named graph" },
  { label: "@list", type: "keyword", info: "Denotes an ordered list" },
  { label: "@set", type: "keyword", info: "Denotes an unordered set" },
  { label: "@reverse", type: "keyword", info: "Defines reverse properties" },
  { label: "@index", type: "keyword", info: "Specifies an index for ordered data" },
  { label: "@base", type: "keyword", info: "Defines the base IRI" },
  { label: "@vocab", type: "keyword", info: "Defines the default vocabulary" },
  { label: "@container", type: "keyword", info: "Specifies container types for properties" },
  { label: "@nest", type: "keyword", info: "Allows nesting of properties" },
  { label: "@prefix", type: "keyword", info: "Defines a prefix mapping" },
  { label: "@propagate", type: "keyword", info: "Controls context propagation" },
  { label: "@protected", type: "keyword", info: "Prevents term overrides" },
  { label: "@version", type: "keyword", info: "Specifies the JSON-LD version" }
];

const editor = new EditorView({
  parent: document.getElementById('editor'),
  doc: `{}`,
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    json(),
    linter(jsonParseLinter()),
    autocompletion({override: [completeFromList(jsonLdAtTerms)]})
  ]
});

const readOnlyEditor = new EditorView({
  parent: document.getElementById('read-only-editor'),
  doc: `{}`,
  extensions: [
    basicSetup,
    json(),
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    EditorView.contentAttributes.of({tabindex: '0'})
  ]
})

createApp({
  doc: {},
  // methods
  async loadExample(file) {
    const rv = await fetch(`/examples/playground/${file}`);
    this.doc = await rv.json();
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: JSON.stringify(this.doc, null, 2)
      }
    });
    // TODO: this should happen elsewhere...like a watcher
    const expanded = await jsonld.expand(this.doc);
    readOnlyEditor.dispatch({
      changes: {
        from: 0,
        to: readOnlyEditor.state.doc.length,
        insert: JSON.stringify(expanded, null, 2)
      }
    });
  }
}).mount();
