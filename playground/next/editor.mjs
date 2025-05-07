import {EditorView, basicSetup} from 'codemirror';
import {createApp} from "petite-vue";
import {indentWithTab} from '@codemirror/commands';
import {json, jsonParseLinter} from "@codemirror/lang-json";
import {keymap} from '@codemirror/view';
import {linter} from '@codemirror/lint';

const editor = new EditorView({
  parent: document.getElementById('editor'),
  doc: `{}`,
  extensions: [
    basicSetup,
    keymap.of([indentWithTab]),
    json(),
    linter(jsonParseLinter())
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
