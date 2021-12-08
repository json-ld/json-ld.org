/**
 * config {
 predicateList: 2,
 objectList: 2,
 bnode: 2,
 }
 */

// **N3Writer** writes N3 documents.
const namespaces = require('n3/lib/IRIs').default;
const N3Fac = require('n3/lib/N3DataFactory');
const { Term } = N3Fac;
const N3DataFactory = N3Fac.default;
const { isDefaultGraph } = require('n3/lib/N3Util');

const DEFAULTGRAPH = N3DataFactory.defaultGraph();

const { rdf, xsd } = namespaces;

// Characters in literals that require escaping
const escape    = /["\\\t\n\r\b\f\u0000-\u0019\ud800-\udbff]/,
    escapeAll = /["\\\t\n\r\b\f\u0000-\u0019]|[\ud800-\udbff][\udc00-\udfff]/g,
    escapedCharacters = {
      '\\': '\\\\', '"': '\\"', '\t': '\\t',
      '\n': '\\n', '\r': '\\r', '\b': '\\b', '\f': '\\f',
    };
const rdf10LocalName = `[a-zA-Z][\\-_a-zA-Z0-9]*`;
const rdf11LocalName = `[a-zA-Z0-9][\\-_a-zA-Z0-9.]*`;

// ## Placeholder class to represent already pretty-printed terms
class SerializedTerm extends Term {
  // Pretty-printed nodes are not equal to any other node
  // (e.g., [] does not equal [])
  equals() {
    return false;
  }
}

// ## Constructor
class Printer {
  constructor(outputStream, options) {
    // ### `_prefixRegex` matches a prefixed name or IRI that begins with one of the added prefixes
    this._prefixRegex = /$0^/;

    // Shift arguments if the first argument is not a stream
    if (outputStream && typeof outputStream.write !== 'function')
      options = outputStream, outputStream = null;
    options = options || {};
    this._lists = options.lists;
    this._predicateList = this.indentFunc(options.predicateList || ';\n    ');
    this._objectList = this.indentFunc(options.objectList || ', ');
    this._bnode = options.bnode || '  ';
    this._checkCorefs = options.checkCorefs || (n => true);
    this._version = options.version || 1.0;
    this._localName = this._version === 1.0
        ? rdf10LocalName
        : rdf11LocalName;

    // If no output stream given, send the output as string through the end callback
    if (!outputStream) {
      let output = '';
      this._outputStream = {
        write(chunk, encoding, done) { output += chunk; done && done(); },
        end: done => { done && done(null, output); },
      };
      this._endStream = true;
    }
    else {
      this._outputStream = outputStream;
      this._endStream = options.end === undefined ? true : !!options.end;
    }

    // Initialize writer, depending on the format
    this._nestings = [];
    if (!(/triple|quad/i).test(options.format)) {
      this._lineMode = false;
      this._graph = DEFAULTGRAPH;
      this._baseIRI = options.baseIRI;
      this._prefixIRIs = Object.create(null);
      options.prefixes && this.addPrefixes(options.prefixes);
    }
    else {
      this._lineMode = true;
      this._writeQuad = this._writeQuadLine;
    }
  }

  indentFunc (str) {
    const parts = str.split(/\n/);
    const tail = parts.pop();
    return function () {
      const indent = this._nestings.length > 0
            ? this._nestings[0].indent
            : '';
      return parts.map(s => s + '\n' + indent).join('') + tail;
    }
  }

  // ## Private methods

  // ### Whether the current graph is the default graph
  get _inDefaultGraph() {
    return DEFAULTGRAPH.equals(this._graph);
  }


  // ### `_write` writes the argument to the output stream
  _write(string, callback) {
    this._outputStream.write(string, 'utf8', callback);
  }

  _closeNestings(targetSubject) {
    const oldLength = this._nestings.length;
    let i = 0;
    for (; i < this._nestings.length && this._nestings.subject.equals(targetSubject); ++i)
      this._write('\n' + this._nestings[i].indent + (this._nestings[i].nested ? ']' : ''));

    this._nestings = this._nestings.slice(i);
    if (this._nestings.length === 0 && oldLength > 0)
      this._write('.\n');
    if (targetSubject !== null) {
      this._write();
      this._nestings.unshift({
        subject: targetSubject,
        predicate: null,
        indent: this._nestings.length > 0
          ? this._nestings[0].indent + this._bnode
          : ''
      });
    }
  }

  // ### `_writeQuad` writes the quad to the output stream
  _writeQuad(subject, predicate, object, graph, done) { // console.log(`${subject.id} ${predicate.id} ${object.id} ${graph.id}`);
    try {
      // Write the graph's label if it has changed
      if (!graph.equals(this._graph)) {
        // Close the previous graph and start the new one
        this._write((this._nestings.length === 0 ? '' : (this._inDefaultGraph ? '.\n' : '\n}\n')) +
                    (DEFAULTGRAPH.equals(graph) ? '' : `${this._encodeIriOrBlank(graph)} {\n`));
        this._graph = graph;
        for (let i = 0; i < this._nestings.length && this._nestings.subject.equals(subject); ++i)
          this._write('\n' + this._nestings[i].indent + (this._nestings[i].nested ? ']' : ''));
      }

      let objectStr, nestable;
      if (object.termType === 'BlankNode'
          && this._checkCorefs
          && !this._checkCorefs(object)) {
        objectStr = '[';
        nestable = true;
      } else {
        objectStr = this._encodeObject(object);
        nestable = false;
      }

      // see if we're already serializing this subject
      const oldLength = this._nestings.length;
      if (this._nestings.length > 0)
        while (!this._nestings[0].subject.equals(subject)) {
          this._write('\n' + this._nestings[0].indent + (this._nestings[0].nested ? ']' : ''));
          this._nestings.shift();
        }
      const reuseFrame = this._nestings.length > 0
            ? this._nestings[0]
            : null;

      // Don't repeat the subject if it's the same
      if (this._nestings.length > 0 && subject.equals(this._nestings[0].subject)) {
        // Don't repeat the predicate if it's the same
        if (predicate.equals(this._nestings[0].predicate)) {
          this._write(`${this._objectList()}${objectStr}`, done);
          // Same subject, different predicate
        } else if (this._nestings[0].fresh) {
          this._write(`\n${this._nestings[0].indent + this._bnode}${
              this._encodePredicate(this._nestings[0].predicate = predicate)} ${
              objectStr}`, done);
        } else {
          this._write(`${this._predicateList()}${
              this._encodePredicate(this._nestings[0].predicate = predicate)} ${
              objectStr}`, done);
        }
      }
      // Different subject; write the whole quad
      else {
        if (reuseFrame && oldLength > 0)
          this._write('.\n');
        if (reuseFrame) {
          this._nestings.unshift({
            subject: subject,
            predicate: predicate,
            indent: reuseFrame.indent + this._bnode
          });
          this._write(`${
                    this._encodePredicate(predicate)} ${
                    objectStr}`, done);
        } else {
          this._nestings.unshift({
            subject: subject,
            predicate: predicate,
            indent: ''
          });
          this._write(`${
                    this._encodeSubject(subject)} ${
                    this._encodePredicate(predicate)} ${
                    objectStr}`, done);
        }
      }
      this._nestings[0].fresh  = false;
      if (nestable) {
        this._nestings.unshift({
          subject: object,
          predicate: null,
          indent: this._nestings[0].indent + this._bnode,
          nested: true,
          fresh: true,
        });
      }
    }
    catch (error) { done && done(error); }
  }

  _finish() {
    const oldLength = this._nestings.length;
    if (this._nestings.length > 0)
      while (this._nestings.length > 0) {
        this._write('\n' + this._nestings[0].indent + (this._nestings[0].nested ? ']' : ''));
        this._nestings.shift();
      }
    if (oldLength !== 0) {
      if (this._inDefaultGraph) {
        this._write('.\n');
      } else {
        this._write('\n}\n');
      }
      return true;
    } else {
      return false;
    }
  }

  // ### `_writeQuadLine` writes the quad to the output stream as a single line
  _writeQuadLine(subject, predicate, object, graph, done) {
    // Write the quad without prefixes
    delete this._prefixMatch;
    this._write(this.quadToString(subject, predicate, object, graph), done);
  }

  // ### `quadToString` serializes a quad as a string
  quadToString(subject, predicate, object, graph) {
    const ret =  `${this._encodeSubject(subject)} ${
            this._encodeIriOrBlank(predicate)} ${
            this._encodeObject(object)
            }${graph && graph.value ? ` ${this._encodeIriOrBlank(graph)} .\n` : ' .\n'}`;
    return ret;
  }

  // ### `quadsToString` serializes an array of quads as a string
  quadsToString(quads) {
    return quads.map(t => {
      return this.quadToString(t.subject, t.predicate, t.object, t.graph);
    }).join('');
  }

  // ### `_encodeSubject` represents a subject
  _encodeSubject(entity) {
    return entity.termType === 'Quad' ?
      this._encodeQuad(entity) : this._encodeIriOrBlank(entity);
  }

  // ### `_encodeIriOrBlank` represents an IRI or blank node
  _encodeIriOrBlank(entity) {
    // A blank node or list is represented as-is
    if (entity.termType !== 'NamedNode') {
      // If it is a list head, pretty-print it
      if (this._lists && (entity.value in this._lists))
        entity = this.list(this._lists[entity.value]);
      return 'id' in entity ? entity.id : `_:${entity.value}`;
    }
    let iri = entity.value;
    // Use relative IRIs if requested and possible
    if (this._baseIRI && iri.startsWith(this._baseIRI))
      iri = iri.substr(this._baseIRI.length);
    // Escape special characters
    if (escape.test(iri))
      iri = iri.replace(escapeAll, characterReplacer);
    // Try to represent the IRI as prefixed name
    const prefixMatch = this._prefixRegex.exec(iri);
    return !prefixMatch ? `<${iri}>` :
           (!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]);
  }

  // ### `_encodeLiteral` represents a literal
  _encodeLiteral(literal) {
    // Escape special characters
    let value = literal.value;
    if (escape.test(value))
      value = value.replace(escapeAll, characterReplacer);

    // Write a language-tagged literal
    if (literal.language)
      return `"${value}"@${literal.language}`;

    // Write dedicated literals per data type
    if (this._lineMode) {
      // Only abbreviate strings in N-Triples or N-Quads
      if (literal.datatype.value === xsd.string)
        return `"${value}"`;
    }
    else {
      // Use common datatype abbreviations in Turtle or TriG
      switch (literal.datatype.value) {
      case xsd.string:
        return `"${value}"`;
      case xsd.boolean:
        if (value === 'true' || value === 'false')
          return value;
        break;
      case xsd.integer:
        if (/^[+-]?\d+$/.test(value))
          return value;
        break;
      case xsd.decimal:
        if (/^[+-]?\d*\.\d+$/.test(value))
          return value;
        break;
      case xsd.double:
        if (/^[+-]?(?:\d+\.\d*|\.?\d+)[eE][+-]?\d+$/.test(value))
          return value;
        break;
      }
    }

    // Write a regular datatyped literal
    return `"${value}"^^${this._encodeIriOrBlank(literal.datatype)}`;
  }

  // ### `_encodePredicate` represents a predicate
  _encodePredicate(predicate) {
    return predicate.value === rdf.type ? 'a' : this._encodeIriOrBlank(predicate);
  }

  // ### `_encodeObject` represents an object
  _encodeObject(object) {
    switch (object.termType) {
    case 'Quad':
      return this._encodeQuad(object);
    case 'Literal':
      return this._encodeLiteral(object);
    default:
      return this._encodeIriOrBlank(object);
    }
  }

  // ### `_encodeQuad` encodes an RDF* quad
  _encodeQuad({ subject, predicate, object, graph }) {
    return `<<${
      this._encodeSubject(subject)} ${
      this._encodePredicate(predicate)} ${
      this._encodeObject(object)}${
      isDefaultGraph(graph) ? '' : ` ${this._encodeIriOrBlank(graph)}`}>>`;
  }

  // ### `_blockedWrite` replaces `_write` after the writer has been closed
  _blockedWrite() {
    throw new Error('Cannot write because the writer has been closed.');
  }

  // ### `addQuad` adds the quad to the output stream
  addQuad(subject, predicate, object, graph, done) {
    // The quad was given as an object, so shift parameters
    if (object === undefined)
      this._writeQuad(subject.subject, subject.predicate, subject.object, subject.graph, predicate);
    // The optional `graph` parameter was not provided
    else if (typeof graph === 'function')
      this._writeQuad(subject, predicate, object, DEFAULTGRAPH, graph);
    // The `graph` parameter was provided
    else
      this._writeQuad(subject, predicate, object, graph || DEFAULTGRAPH, done);
  }

  // ### `addQuads` adds the quads to the output stream
  addQuads(quads) {
    for (let i = 0; i < quads.length; i++)
      this.addQuad(quads[i]);
  }

  // ### `addPrefix` adds the prefix to the output stream
  addPrefix(prefix, iri, done) {
    const prefixes = {};
    prefixes[prefix] = iri;
    this.addPrefixes(prefixes, done);
  }

  // ### `addPrefixes` adds the prefixes to the output stream
  addPrefixes(prefixes, done) {
    // Ignore prefixes if not supported by the serialization
    if (!this._prefixIRIs)
      return done && done();

    // Write all new prefixes
    let hasPrefixes = false;
    for (let prefix in prefixes) {
      let iri = prefixes[prefix];
      if (typeof iri !== 'string')
        iri = iri.value;
      hasPrefixes = true;
      // Finish a possible pending quad
      if (this._finish())
        this._graph = '';
      // Store and write the prefix
      this._prefixIRIs[iri] = (prefix += ':');
      if (this._version > 1) {
        this._write(`PREFIX ${prefix} <${iri}>\n`);
      } else {
        this._write(`@prefix ${prefix} <${iri}>.\n`);
      }
    }
    // Recreate the prefix matcher
    if (hasPrefixes) {
      let IRIlist = '', prefixList = '';
      for (const prefixIRI in this._prefixIRIs) {
        IRIlist += IRIlist ? `|${prefixIRI}` : prefixIRI;
        prefixList += (prefixList ? '|' : '') + this._prefixIRIs[prefixIRI];
      }
      IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
      this._prefixRegex = new RegExp(`^(?:${prefixList})[^\/]*$|` +
                                     `^(${IRIlist})(${this._localName})$`);
    }
    // End a prefix block with a newline
    this._write(hasPrefixes ? '\n' : '', done);
  }

  // ### `blank` creates a blank node with the given content
  blank(predicate, object) {
    let children = predicate, child, length;
    // Empty blank node
    if (predicate === undefined)
      children = [];
    // Blank node passed as blank(Term("predicate"), Term("object"))
    else if (predicate.termType)
      children = [{ predicate: predicate, object: object }];
    // Blank node passed as blank({ predicate: predicate, object: object })
    else if (!('length' in predicate))
      children = [predicate];

    switch (length = children.length) {
    // Generate an empty blank node
    case 0:
      return new SerializedTerm('[]');
    // Generate a non-nested one-triple blank node
    case 1:
      child = children[0];
      if (!(child.object instanceof SerializedTerm))
        return new SerializedTerm(`[ ${this._encodePredicate(child.predicate)} ${
                                  this._encodeObject(child.object)} ]`);
    // Generate a multi-triple or nested blank node
    default:
      let contents = '[';
      // Write all triples in order
      for (let i = 0; i < length; i++) {
        child = children[i];
        // Write only the object is the predicate is the same as the previous
        if (child.predicate.equals(predicate))
          contents += `, ${this._encodeObject(child.object)}`;
        // Otherwise, write the predicate and the object
        else {
          contents += `${(i ? ';\n  ' : '\n  ') +
                      this._encodePredicate(child.predicate)} ${
                      this._encodeObject(child.object)}`;
          predicate = child.predicate;
        }
      }
      return new SerializedTerm(`${contents}\n]`);
    }
  }

  // ### `list` creates a list node with the given content
  list(elements) {
    const length = elements && elements.length || 0, contents = new Array(length);
    for (let i = 0; i < length; i++)
      contents[i] = this._encodeObject(elements[i]);
    return new SerializedTerm(`(${contents.join(' ')})`);
  }

  // ### `end` signals the end of the output stream
  end(done) {
    // Finish a possible pending quad
    this._finish();
    // Disallow further writing
    this._write = this._blockedWrite;

    // Try to end the underlying stream, ensuring done is called exactly one time
    let singleDone = done && ((error, result) => { singleDone = null, done(error, result); });
    if (this._endStream) {
      try { return this._outputStream.end(singleDone); }
      catch (error) { /* error closing stream */ }
    }
    singleDone && singleDone();
  }
}

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

if (typeof module !== 'undefined')
  module.exports = {Printer};
