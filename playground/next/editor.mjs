/* globals: jsonld */

import {autocompletion, completeFromList} from '@codemirror/autocomplete';
import {EditorView, basicSetup} from 'codemirror';
import {createApp} from "petite-vue";
import {Compartment, EditorState} from '@codemirror/state'
import {indentWithTab} from '@codemirror/commands';
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {StreamLanguage} from '@codemirror/language';
import {ntriples} from '@codemirror/legacy-modes/mode/ntriples';
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

// TODO: the next two functions could probably become a petite-vue component
function editorListener(docName) {
  let changes = []; // keep the changes as a list; then pick the last one
  let timer; // we only want one timer, once the last one is done, use the result
  function debounce(fn, delay) {
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  return EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      changes.push(update.state.doc.toString());
      debounce((docName) => {
        // set the global `doc` to the latest string from the editor
        try {
          const parsed = JSON.parse(changes[changes.length-1]);
          this[docName] = parsed;
          this.parseError = '';
        } catch (err) {
          this.parseError = err.message;
        };
      }, 1000).call(this, docName);
    }
  });
}
function initEditor(id, content, varName) {
  return new EditorView({
    parent: document.getElementById(id),
    doc: JSON.stringify(content, null, 2),
    extensions: [
      basicSetup,
      keymap.of([indentWithTab]),
      json(),
      linter(jsonParseLinter()),
      autocompletion({override: [completeFromList(jsonLdAtTerms)]}),
      editorListener.call(this, varName)
    ]
  });
}

const language = new Compartment();

const readOnlyEditor = new EditorView({
  parent: document.getElementById('read-only-editor'),
  doc: `{}`,
  extensions: [
    basicSetup,
    language.of(json()),
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    EditorView.contentAttributes.of({tabindex: '0'})
  ]
});

function setEditorValue(_editor, doc) {
  if (_editor) {
    _editor.dispatch({
      changes: {
        from: 0,
        to: _editor.state.doc.length,
        insert: typeof(doc) === 'object'
          ? JSON.stringify(doc, null, 2)
          : doc
      },
      // set the correct language
      effects: language.reconfigure(typeof(doc) === 'object'
        ? json()
        : StreamLanguage.define(ntriples))
    });
  }
}

window.app = createApp({
  doc: {},
  contextDoc: {},
  frameDoc: {},
  tableQuads: {},
  remoteDocURL: '',
  remoteSideDocURL: '',
  parseError: '',
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
    if (['compacted', 'flattened', 'framed'].indexOf(this.outputTab) > -1) {
      return 'two column';
    }
    return '';
  },
  get hasTableQuads() {
    return Object.keys(this.tableQuads).length > 0;
  },
  get sideDoc() {
    if (this.outputTab === 'framed') {
      return 'frameDoc';
    } else {
      return 'contextDoc';
    }
  },
  get sideEditor() {
    if (this.outputTab === 'framed') {
      return this.frameEditor;
    } else {
      return this.contextEditor;
    }
  },
  get sideEditorURLFieldPlaceholderText() {
    if (this.outputTab === 'framed') {
      return 'Frame URL';
    } else {
      return 'Context URL';
    }
  },
  // methods
  async retrieveDoc(_editor, docVar, url) {
    try {
      const rv = await fetch(url);
      if (!rv.ok) {
        throw new Error(`HTTP error status: ${rv.status}`);
      }
      this[docVar] = await rv.json();
      setEditorValue(_editor, this[docVar]);
      // clear the remoteDocURL to avoid confusion around state
      this.remoteDocURL = '';
      this.remoteSideDocURL = '';
    } catch (err) {
      this.parseError = err.message;
    }
  },
  async loadExample(file) {
    const rv = await fetch(`/examples/playground/${file}`);
    this.doc = await rv.json();
    setEditorValue(this.mainEditor, this.doc);
    // TODO: make this less of a hack...so we can provide other frames
    if (file === 'library.jsonld') {
      const frame = await fetch(`/examples/playground/library-frame.jsonld`);
      this.frameDoc = await frame.json();
      setEditorValue(this.frameEditor, this.frameDoc);
    } else {
      this.frameDoc = {};
      setEditorValue(this.frameEditor, this.frameDoc);
    }
    this.setOutputTab(this.outputTab);
  },
  async setOutputTab(value) {
    this.outputTab = value;
    let context = this.contextDoc;
    switch (this.outputTab) {
      case 'expanded':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const expanded = await jsonld.expand(this.doc, this.options);
          setEditorValue(readOnlyEditor, expanded);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'compacted':
        if (JSON.stringify(context) === '{}' && '@context' in this.doc) {
          // no context set yet, so copy in the main document's
          context = {
            '@context': this.doc['@context']
          };
          this.contextDoc = context;
        }
        try {
          const compacted = await jsonld.compact(this.doc, {'@context': context['@context'] || {}}, this.options);
          setEditorValue(readOnlyEditor, compacted);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'flattened':
        if (JSON.stringify(context) === '{}' && '@context' in this.doc) {
          // no context set yet, so copy in the main document's
          context = {
            '@context': this.doc['@context']
          };
          this.contextDoc = context;
        }
        try {
          const flattened = await jsonld.flatten(this.doc, {'@context': context['@context'] || {}}, this.options);
          setEditorValue(readOnlyEditor, flattened);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'framed':
        try {
          const framed = await jsonld.frame(this.doc, this.frameDoc, this.options);
          setEditorValue(readOnlyEditor, framed);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'nquads':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const output = await jsonld.toRDF(this.doc, {
            format: 'application/n-quads',
            ...this.options
          });
          setEditorValue(readOnlyEditor, output);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'canonized':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const output = await jsonld.canonize(this.doc, {
            format: 'application/n-quads', ...this.options
          });
          setEditorValue(readOnlyEditor, output);
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      case 'table':
        // TODO: this should happen elsewhere...like a watcher
        try {
          const output = await jsonld.toRDF(this.doc, this.options);
          this.tableQuads = output;
          this.parseError = '';
        } catch(err) {
          this.parseError = err.message;
        }
        break;
      default:
        setEditorValue(readOnlyEditor, {});
    }
  },
  async docChanged(docName, v) {
    // TODO: see if this could work as a "component"
    if (docName === 'main') this.doc = v;
    if (docName === 'context') this.contextDoc = v;
    if (docName === 'frame') this.frameDoc = v;
    this.setOutputTab(this.outputTab);
  },
  initContextEditor() {
    this.contextEditor = initEditor.call(this, 'context-editor',
      this.contextDoc, 'contextDoc');
  },
  initFrameEditor() {
    this.frameEditor = initEditor.call(this, 'frame-editor', this.frameDoc,
      'frameDoc');
  },
  initMainEditor() {
    this.mainEditor = initEditor.call(this, 'editor', {}, 'doc');
  },
  copyContext() {
    this.contextDoc = {
      '@context': this.doc['@context']
    };
    setEditorValue(this.contextEditor, this.contextDoc);
  }
}).mount();
