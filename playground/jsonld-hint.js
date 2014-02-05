;(function (CodeMirror, Pos) {
  
  var ldKeywords = [
    "context",
    "id",
    "value",
    "language",
    "type",
    "container",
    "list",
    "set",
    "reverse",
    "index",
    "base",
    "vocab",
    "graph"
  ];
  
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
      !str || ~kw.indexOf(str) ? _('@' + kw) : null;
    });
    
    if(str){ result.sort(relevanceComparator(str)); }
    
    return accum(result, function(_, kw){
      _({text: kw, className: "cm-meta"});
    });
  }
  
  function contextLike(str, doc){
    var ctx, key,
      result = [];
    
    str = str ? String(str).trim() : "";
    
    if(doc && (ctx = doc["@context"])){
      for(key in ctx){
        if(!ctx.hasOwnProperty(key)){ return; }
        !str || ~key.indexOf(str) ? result.push(key) : null;
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
  
  CodeMirror.registerHelper("hint", "jsonld", function(editor, options){
    
     // Find the token at the cursor
    var cur = editor.getCursor(),
      token = getToken(editor, cur),
      tprop = token,
      
      // was this started by pressing "@"
      isAt = options.isAt,
      lastParsed = options.lastParsed,
      
      word = token.string,
      start = token.start,
      end = token.end + -1 * (word.slice(-1) === '"'),
      
      match,
      stripped = false;
      
    function suggest(suggestions){
      return {
        list: suggestions,
        from: Pos(cur.line, start + 1),
        to: Pos(cur.line, end)
      }; 
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
}).call(this, CodeMirror, CodeMirror.Pos);
