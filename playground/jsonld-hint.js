;(function (CodeMirror, Pos) {

  var ldKeywords = [];

  var previousHint;

  function getToken(e, cur){ return e.getTokenAt(cur); }

  function accum(arr, fn, result){
    result = result || [];
    var len = arr.length,
      _ = function(val){ result.push(val); };
    for(var i=0; i < len; i++){
      fn(_, arr[i], i);
    }
    return result;
  }

  function keywordsLike(str){
    str = str ? String(str).trim() : "";
    var result = accum(ldKeywords, function(_, kw){
      !str || ~kw.key.indexOf(str) ? _(kw.key) : null;
    });

    if(str){ result.sort(relevanceComparator(str)); }

    return accum(result, function(_, kw){
      _({
        text: kw,
        className: "cm-meta"
      });
    });
  }

  function contextLike(str, doc){
    var ctx, key,
      result = [];

    str = str ? String(str).trim() : "";

    if(doc && (ctx = doc["@context"])){
      for(key in ctx){
        if(!ctx.hasOwnProperty(key)){ return; }
        !str || ~key.indexOf(str) ? result.push({text: key}) : null;
      }
    }
    return result;
  }

  function relevanceComparator(str){
    return function(a, b){
      var result = a.indexOf(str) - b.indexOf(str);
      if(!result){
        return a.localeCompare(b);
      }
      return result;
    };
  }

  function hidePopover(){
    previousHint && previousHint.popover("destroy");
    previousHint = null;
  }

  function showPopover(doc){
    return function(hint){

      hidePopover();

      // sigh.
      previousHint = $(".CodeMirror-hint-active");

      var ctx,
        hintObj,
        prefixed,
        val,
        title,
        content;

      for(var i = 0; i < ldKeywords.length; i++){
        if(ldKeywords[i].key === hint.text){
          hintObj = ldKeywords[i];
        }
      }

      if(!hintObj && doc && (ctx = doc["@context"])){
        if(ctx.hasOwnProperty(hint.text)){
          val = ctx[hint.text];
          if(hint.text.indexOf(":") !== -1){
            prefixed = hint.text.split(":");
            // some kind of prefix?
            hintObj = {
              type: val["@type"] || undefined,
              description: (ctx[prefixed[0]] || "") + prefixed[1]
            };
          }else if(typeof val === "object"){
            // some complex thing?
            hintObj = {
              type: val["@type"] || undefined,
              description: val["@id"]
            };
          }else{
            // some kind of naked value?
            hintObj = {
              description: val
            };
          }
        }
      }

      if(!hintObj){ return; }

      title = hintObj.type ?
        (hintObj.type.pop ?
          hintObj.type.join(", ") :
          hintObj.type) :
        undefined;
      content =  hintObj.description || "";

      previousHint.popover({
        content: content,
        title: title,
        container: "body"
      });
      previousHint.popover("show");
    };
  }

  function findLdKeywords(schemata){
    var i,
      def_key,
      def,
      prop_key,
      prop;
    // pull out the @ keywords
    for(i = 0; i < schemata.length; i++){
      var schema = schemata[0];
      for(def_key in schema.definitions){
        def = schema.definitions[def_key];
        for(prop_key in def.properties){
          prop = def.properties[prop_key];
          if(prop_key.indexOf("@") === 0){
            ldKeywords.push({
              key: prop_key,
              description: prop.description,
              type: prop.type,
              format: prop.format
            });
          }
        }
      }
    }
  }

  CodeMirror.registerHelper("hint", "jsonld", function(editor, options){

     // Find the token at the cursor
    var cur = editor.getCursor(),
      token = getToken(editor, cur),
      tprop = token,

      // was this started by pressing "@"
      isAt = options.isAt,
      lastParsed = options.lastParsed,

      schemata = typeof options.schemata === "function" ?
        options.schemata() :
        options.schemata,

      word = token.string,
      start = token.start,
      end = token.end + -1 * (word.slice(-1) === '"'),

      match,
      stripped = false;

    if(!ldKeywords.length && schemata.length){
      findLdKeywords(schemata);
    }

    function suggest(suggestions){
      var hints = {
        list: suggestions,
        from: Pos(cur.line, start + 1),
        to: Pos(cur.line, end)
      };

      // various hint events
      CodeMirror.on(hints, "select", showPopover(lastParsed));
      CodeMirror.on(hints, "close", hidePopover);

      return hints;
    }

    token.state = CodeMirror.innerMode(editor.getMode(), token.state).state;

    // clean up words, move pointers
    if(word.match(/^[\{\[]/)){
      // i just made an empty list and typed "@"...
      word = "";
      start++;
      stripped = true;
    }else if(word.match(/^"/)){
      // i just started a quoted string...
      word = word.replace(/(^"|"$)/g, "");
      stripped = true;
    }

    if(isAt){
      // this was started by pressing @..
      if(!~word.indexOf("@")){
        // and the user is expecting a @
        editor.replaceSelection("@", "end", "+input");
      }else if(!stripped){
        start--;
      }
      return suggest(keywordsLike(word.replace("@", "")));
    }else if(match = word.match(/^"?@(.*)/)){
      return suggest(keywordsLike(match[1]));
    }

    return suggest(contextLike(word, lastParsed).concat(keywordsLike(word)));

  });
}).call(this, CodeMirror, CodeMirror.Pos, $);
