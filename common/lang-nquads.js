/**
 * @fileoverview
 * Registers a language handler for prettify.js for N-Quads.
 *
 * @author David I. Lehn <dlehn@digitalbazaar.com>
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 */
// FIXME: copied from turtle, needs simplification and clean up
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_ATTRIB_NAME + " nquads-curie", /^.*/]
    ]), ['nquads-property']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " nquads-uri", /^.*/]
    ]), ['nquads-uri']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " nquads-curie", /^.*/]
    ]), ['nquads-curie']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_STRING, /^.*/]
    ]), ['nquads-string']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_LITERAL, /^.*/]
    ]), ['nquads-typed-literal-value']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TYPE + " nquads-curie", /^.*/]
    ]), ['nquads-typed-literal-type']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      // FIXME: use RE that excludes ^^ from the value
      ["lang-nquads-typed-literal-value", /^(.*\^\^)/],
      ["lang-nquads-typed-literal-type", /^(.*)/],
    ]), ['nquads-typed-literal']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [
      //[PR.PR_PUNCTUATION, /^[:|>?]+/, null, ':|>?'],
      //[PR.PR_PLAIN, /^\s+/, null, ' \t\r\n']
    ],
    [
      // empty string
      // other properties
      ["lang-nquads-property", /^"(.*)"\^\^/],
      //[PR.PR_LITERAL, /^""/],
      ["lang-nquads-string", /^"([^"]*)"/],
      // "<...>"
      ["lang-nquads-uri", /^<([^:]+:[^>]*)>[ \t]*/],
      ["lang-nquads-uri", /^<([^:]+:[^>]*)>\./],
      // typed literals
      ["lang-nquads-typed-literal", /^"([^^"]+\^\^[^"]+)"/],
      // "foo:bar"
      ["lang-nquads-curie", /^(_:[^ ]*)/],
      // literal strings
      ["lang-nquads-string", /^""/],
      // constants and native types
      [PR.PR_LITERAL, /^(?:true|false|null|undefined)/],
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
    ]), ['nquads']);
