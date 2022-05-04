/**
 *
 */
const N3 = require('n3');
const Fs = require("fs");

class RdfResource {
    prefixes = [];
    store = new N3.Store();
    base = null;
}

class TurtleParser {
    constructor() {
    }
    async parse(text, base) {
        return new Promise(((resolve, reject) => {
            const parser = new N3.Parser({
                format: 'text/turtle',
                baseIRI: base, // 'http://a.example/some/path/file.ext?a=b&c=d#fragment',
                blankNodePrefix: '_:myBNode_'
            });

            const ret = new RdfResource();
            parser.parse(
                text,
                (error, quad, prefixes) => {
                    if (prefixes) {
                        ret.prefixes = prefixes;
                    }
                    if (quad) {
                        ret.store.add(quad);
                    } else {
                        ret.base = parser._base;
                        resolve(ret);
                    }
                });

        }))
    }

    async parseFile(filepath) {
        const text = await Fs.promises.readFile(filepath, 'utf8');
        return this.parse(text, 'file://' + filepath);
    }
}

if (typeof module !== 'undefined')
    module.exports = {TurtleParser, RdfResource};