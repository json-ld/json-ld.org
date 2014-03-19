// Depends on jsonlint.js from https://github.com/pmseltmann/jsonlint
// Depends on tv4.js from https://github.com/geraintluff/tv4

// declare global: jsonlint, tv4
CodeMirror.registerHelper("lint", "jsonSchema",
  function(cm, done, options) {
    var found = [],
      parsed,
      schemaResults,
      i,
      schemata = options.schemata || [];

    if(typeof schemata === "function"){
      schemata = schemata(cm);
    }

    // this is kind of naughty
    jsonlint.parseError = function(str, hash){
      var loc = hash.loc;
      found.push({
        from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
        to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
        message: str
      });
    };

    try{
      parsed = jsonlint.parse(cm.getValue());
    }catch(e){}

    if(parsed && schemata.length){
      schemata.forEach(function(schema){
        schemaResults = tv4.validateMultiple(parsed.parsedObject, schema);
        schemaResults.errors.forEach(function(err){
          var loc = parsed.lineIndex[err.dataPath.replace("/", ".")] || 0;

          found.push({
            from: CodeMirror.Pos(loc, loc.first_column),
            to: CodeMirror.Pos(loc, loc.last_column),
            message: err.schemaPath + ": " + err.message,
            severity: "warning"
          });
        });
      });
    }

    done(cm, found);
  });