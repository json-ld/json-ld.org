/* globals: jsonld */

import {autocompletion, completeFromList} from '@codemirror/autocomplete';
import {EditorView, basicSetup} from 'codemirror';
import {createApp, reactive} from "petite-vue";
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

// the main document we're working with throughout (see `v-scope`)
const store = reactive({
  doc: {},
  sideDoc: {},
  parseError: ''
});

const mainEditorListener = EditorView.updateListener.of((update) => {
  if (update.docChanged) {
    // set the global `doc` to the latest string from the editor
    try {
      const parsed = JSON.parse(update.state.sliceDoc(0, update.state.doc.length));
      store.doc = parsed;
      store.parseError = '';
    } catch (err) {
      store.parseError = err.message;
    };
  }
});

const editor = new EditorView({
  parent: document.getElementById('editor'),
  doc: `{}`,
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    json(),
    linter(jsonParseLinter()),
    autocompletion({override: [completeFromList(jsonLdAtTerms)]}),
    mainEditorListener
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
});

function setEditorValue(_editor, doc) {
  _editor.dispatch({
    changes: {
      from: 0,
      to: _editor.state.doc.length,
      insert: JSON.stringify(doc, null, 2)
    }
  });
}

window.app = createApp({
  store,
  inputTab: 'json-ld',
  outputTab: 'expanded',
  options: {
    processingMode: '',
    base: '',
    baseUrl: '',
    compactArrays: true,
    compactToRelative: true,
    rdfDirection: '',
    safe: ''
  },
  // computed
  get editorColumns() {
    if (this.outputTab === 'compacted') {
      return 'two column';
    }
    return '';
  },
  // methods
  async loadExample(file) {
    const rv = await fetch(`/examples/playground/${file}`);
    this.store.doc = await rv.json();
    setEditorValue(editor, this.store.doc);
    this.setOutputTab(this.outputTab);
  },
  async setOutputTab(value) {
    this.outputTab = value;
    const doc = this.store.doc;
    switch (this.outputTab) {
      case 'expanded':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const expanded = await jsonld.expand(doc, this.options);
          setEditorValue(readOnlyEditor, expanded);
          this.store.parseError = '';
        } catch(err) {
          this.store.parseError = err.message;
        }
        break;
      case 'compacted':
        const context = this.store.sideDoc;
        if (JSON.stringify(context) === '{}' && '@context' in doc) {
          // no context set yet, so copy in the main document's
          context['@context'] = doc['@context'];
        }
        try {
          const compacted = await jsonld.compact(doc, context['@context'] || {}, this.options);
          setEditorValue(readOnlyEditor, compacted);
          this.store.parseError = '';
        } catch(err) {
          this.store.parseError = err.message;
        }
        break;
      case 'flattened':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const flattened = await jsonld.flatten(doc, {}, this.options);
          setEditorValue(readOnlyEditor, flattened);
          this.store.parseError = '';
        } catch(err) {
          this.store.parseError = err.message;
        }
        break;
      default:
        setEditorValue(readOnlyEditor, {});
    }
  },
  async docChanged(v) {
    this.setOutputTab(this.outputTab);
  },
  initSideEditor() {
    const sideEditorListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        try {
          const parsed = JSON.parse(update.state.sliceDoc(0, update.state.doc.length));
          store.sideDoc = parsed;
          store.parseError = '';
        } catch (err) {
          store.parseError = err.message;
        };
      }
    });

    // Used for context, frame, or other secondary document provision
    this.sideEditor = new EditorView({
      parent: document.getElementById('side-editor'),
      doc: JSON.stringify(this.store.sideDoc, null, 2),
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        json(),
        linter(jsonParseLinter()),
        autocompletion({override: [completeFromList(jsonLdAtTerms)]}),
        sideEditorListener
      ]
    });
  },
  copyContext() {
    console.log('copy context');
    this.store.sideDoc['@context'] = this.store.doc['@context'];
    setEditorValue(this.sideEditor, this.store.sideDoc);
  }
}).mount();
