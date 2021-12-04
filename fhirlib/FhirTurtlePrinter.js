/**
 * config {
 predicateList: 2,
 objectList: 2,
 bnode: 2,
 }
 */
const TurtleParser = require('./TurtleParser');
const P = require('./Prefixes');

// Cribbed from N3Writer
// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };

// Replaces a character by its escaped version
function characterReplacer(character) {
  // Replace a single character by its escaped version
  let result = escapedCharacters[character];
  if (result === undefined) {
    // Replace a single character with its 4-bit unicode escape sequence
    if (character.length === 1) {
      result = character.charCodeAt(0).toString(16);
      result = '\\u0000'.substr(0, 6 - result.length) + result;
    }
    // Replace a surrogate pair with its 8-bit unicode escape sequence
    else {
      result = ((character.charCodeAt(0) - 0xD800) * 0x400 +
          character.charCodeAt(1) + 0x2400).toString(16);
      result = '\\U00000000'.substr(0, 10 - result.length) + result;
    }
  }
  return result;
}

function c (n) {
  switch (n.termType) {
    case 'NamedNode':
      const prefix = Object.keys(P).find(prefix => n.value.startsWith(P[prefix]));
      if (prefix === undefined) {
        return '<' + n.value.replace(escapeAll, characterReplacer) + '>';
      } else {
        return prefix + n.value.substr(P[prefix].length).replace(/[aeiou]/g, c => '%' + c.charCodeAt(0));
      }
    case 'BlankNode':
      return '_:' + n.value;
    case 'Literal':
      return '"' + n.value.replace(escapeAll, characterReplacer)
    default:
      throw new Error(`unexpected node type: ${JSON.stringify(n)}`);
  }
}

class Printer {
  constructor (config) {
    this.config = config;
    this.subjects = [];
    this.texts = new Map();
  }

  addQuad (q) {
    const s = c(q.subject);
    if (!this.texts.has(s)) {
      this.texts.set(s, {
        text: s,
        last: q
      });
      this.subjects.push(s);
    } else {
      this.texts.set(s, {
        text: this.texts.get(s).text + '\n  ',
        last: q
      });
    }
  }

  addQuads (triples) {
    triples.forEach(q => this.addQuad(q))
  }

  toString () {
    return this.subjects.reduce((acc, s) => acc + this.texts(s).text + '\n', '');
  }
}

if (typeof module !== 'undefined')
  module.exports = {Printer};
