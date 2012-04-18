/**
 * @fileoverview
 * Registers a language handler for prettify.js for TURTLE.
 *
 * @author David I. Lehn <dlehn@digitalbazaar.com>
 * @author Manu Sporny <msporny@digitalbazaar.com>
 */

PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_KEYWORD, /^.*/]
    ]), ['turtle-keyword']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_ATTRIB_NAME + " turtle-curie", /^.*/]
    ]), ['turtle-property']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " turtle-uri", /^.*/]
    ]), ['turtle-uri']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TAG + " turtle-curie", /^.*/]
    ]), ['turtle-curie']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_STRING, /^.*/]
    ]), ['turtle-string']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_LITERAL, /^.*/]
    ]), ['turtle-typed-literal-value']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      [PR.PR_TYPE + " turtle-curie", /^.*/]
    ]), ['turtle-typed-literal-type']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [], [
      // FIXME: use RE that excludes ^^ from the value
      ["lang-turtle-typed-literal-value", /^(.*\^\^)/],
      ["lang-turtle-typed-literal-type", /^(.*)/],
    ]), ['turtle-typed-literal']);
PR.registerLangHandler(
  PR.createSimpleLexer(
    [
      //[PR.PR_PUNCTUATION, /^[:|>?]+/, null, ':|>?'],
      //[PR.PR_PLAIN, /^\s+/, null, ' \t\r\n']
    ],
    [
      // common "keywords"
      ["lang-turtle-keyword", /^"(@prefix)"\s*:/],
      // empty string
      // other properties
      ["lang-turtle-property", /^"(.*)"\^\^/],
      //[PR.PR_LITERAL, /^""/],
      ["lang-turtle-string", /^"([^"]*)"/],
      // "<...>"
      ["lang-turtle-uri", /^<(http:.*)> /],
      ["lang-turtle-uri", /^<(http:.*)>\./],
      ["lang-turtle-uri", /^<(http:.*)>\;/],
      ["lang-turtle-uri", /^<(http:.*)>/],
      // typed literals
      ["lang-turtle-typed-literal", /^"([^^"]+\^\^[^"]+)"/],
      // "foo:bar"
      ["lang-turtle-curie", /^(_:[^ ]*)/],
      // literal strings
      ["lang-turtle-string", /^""/],
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
    ]), ['turtle']);
