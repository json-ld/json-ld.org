import {autocompletion, completeFromList} from '@codemirror/autocomplete';
import {EditorView, basicSetup} from 'codemirror';
import {createApp} from "petite-vue";
import {indentWithTab} from '@codemirror/commands';
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {keymap} from '@codemirror/view';
import {linter} from '@codemirror/lint';

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

window.editor = editor;

window.app = createApp({
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
  }
}).mount();
