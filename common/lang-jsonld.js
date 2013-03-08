/**
 * @fileoverview
 * Registers a language handler for prettify.js for JSON-LD.
 *
 * @author David I. Lehn <dlehn@digitalbazaar.com>
 */

PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_KEYWORD, /^.*/]
    ]), ['jsonld-keyword']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_ATTRIB_NAME + " jsonld-curie", /^.*/]
    ]), ['jsonld-property']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " jsonld-uri", /^.*/]
    ]), ['jsonld-uri']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " jsonld-curie", /^.*/]
    ]), ['jsonld-curie']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_STRING, /^.*/]
    ]), ['jsonld-string']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_LITERAL, /^.*/]
    ]), ['jsonld-typed-literal-value']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TYPE + " jsonld-curie", /^.*/]
    ]), ['jsonld-typed-literal-type']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      // FIXME: use RE that excludes ^^ from the value
      ["lang-jsonld-typed-literal-value", /^(.*\^\^)/],
      ["lang-jsonld-typed-literal-type", /^(.*)/],
    ]), ['jsonld-typed-literal']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [
      //[PR.PR_PUNCTUATION, /^[:|>?]+/, null, ':|>?'],
      //[PR.PR_PLAIN, /^\s+/, null, ' \t\r\n']
    ],
    [
      // common "keywords"
      ["lang-jsonld-keyword", /^"(@context|@id|@value|@language|@type|@container|@list|@set|@reverse|@index|@base|@vocab|@graph)"\s*:/],
      // empty string
      //[PR.PR_LITERAL, /^""/],
      ["lang-jsonld-string", /^""/],
      // other properties
      ["lang-jsonld-property", /^"(.*)"\s*:/],
      // "<...>"
      ["lang-jsonld-uri", /^"(http:\/\/.*|https:\/\/.*)"/],
      // typed literals
      ["lang-jsonld-typed-literal", /^"([^^"]+\^\^[^"]+)"/],
      // "foo:bar"
      ["lang-jsonld-curie", /^"([^":]*:[^"]*)"/],
      // literal strings
      ["lang-jsonld-string", /^"([^"]*)"/],
      // constants and native types
      [PR.PR_LITERAL, /^(?:true|false|null)/],
      [PR.PR_LITERAL,
       new RegExp(
           '^(?:'
           // A hex number
           + '0x[a-f0-9]+'
           // or an octal or decimal number,
           + '|(?:\\d(?:_\\d+)*\\d*(?:\\.\\d*)?|\\.\\d\\+)'
           // possibly in scientific notation
           + '(?:e[+\\-]?\\d+)?'
           + ')', 'i'),
       null, '0123456789'],
      [PR.PR_PLAIN, /^\w+/]
    ]), ['jsonld']);
