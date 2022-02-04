/**
 * The JSON-LD playground is used to test out JavaScript Object Notation
 * for Linked Data.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 * @author Nicholas Bollweg
 * @author Markus Lanthaler
 */
;(function($, CodeMirror, jsonld, Promise){
  "use strict";
  // assume nothing
  var window = this,
  console = window.console,
  setTimeout = window.setTimeout,
  document = window.document,

  // create the playground instance if it doesn't already exist
  playground = window.playground = {},

  // given this is needed, we probably need a `Document` class...
  docs = function(){
    return {
      markup: null,
      frame: null,
      context: null
    };
  };

  // the codemirror editors
  playground.editors = docs();

  // ... and outputs
  playground.outputs = {};

  // default theme
  playground.theme = "neat";

  // the last parsed version of same
  playground.lastParsed = docs();

  // set the active tab to the expanded view
  playground.activeTab = 'tab-expanded';

  // map of original to modifed contexts
  playground.contextMap = {
    // be careful when working with redirectors as as Chrome (not firefox)
    // will drop Accept: application/ld+json after redirecting
  };

  // map of currently active mapped contexts for user feedback use
  playground.activeContextMap = {};

  // JSON schema for JSON-LD documents
  playground.schema = null;

  // copy context from the input
  playground.copyContext = false;

  // currently-active urls
  playground.remoteUrl = docs();

  // whether a remote document should be used
  playground.useRemote = docs();


  /**
   * Get a query parameter by name.
   *
   * Code from:
   * http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript/5158301#5158301
   *
   * @param name a query parameter name.
   *
   * @return the value of the parameter or null if it does not exist
   */
  function getParameterByName(name) {
    var match = new RegExp('[#?&]' + name + '=([^&]*)')
      .exec(window.location.hash || window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }


  /**
   * Consistent human-readable JSON formatting.
   *
   * @param the object or string to humanize.
   *
   * @return a string containing the humanized string.
   */
  playground.humanize = function(value) {
    switch($.type(value)) {
      case 'string': return value;
      case 'error': return value.toString();
      default: return JSON.stringify(value, null, 2);
    }
  };


  /**
   * Handle URL query parameters.
   *
   * Checks 'json-ld', 'context', and 'frame' parameters.  If they look
   * like JSON then interpret as JSON strings else interpret as URLs of remote
   * resources.  Note: URLs must be CORS enabled to load due to browser same
   * origin policy issues.
   *
   * If 'startTab' is present, select that tab automatically.
   */
  playground.processQueryParameters = function() {
    // data from the query
    var queryData = docs();

    /**
     * Read a parameter as JSON or create an jQuery AJAX Deferred call
     * to read the data.
     *
     * @param param a query parameter value.
     * @param fieldName the field name to populate in queryData object.
     * @param msgName the param name to use in UI messages.
     *
     * @return jQuery Deferred or null.
     */
    function handleParameter(param, fieldName) {
      // the ajax deferred or null
      var rval = null;

      // check 'json-ld' parameter
      if(param !== null) {
        if(param.length === 0 || param[0] === '{' || param[0] === '[') {
          // param looks like JSON, try to parse it
          try {
            queryData[fieldName] = JSON.parse(param);
            playground.setRemoteUrl(fieldName, null);
          }
          catch(e) {
            queryData[fieldName] = param;
          }
        }
        else {
          rval = playground.setRemoteUrl(fieldName, param);
          playground.toggleRemote(fieldName, true);
          if(rval){
            rval.then(function(data){
              queryData[fieldName] = data;
            });
          }
        }
      }

      return rval;
    }

    function handleGist(gist){
      /**
       * Turn the contents of a gist into the equivalent of the legacy URL
       * scheme
       * @param gist: a gist id
      */
      var deferreds = [],
        manifest = JSON.parse(gist.files["playground.jsonld"].content),
        done = function(){
          $('#' + manifest["startTab"]).tab('show');
          playground.populateWithJSON(queryData);
        };

      playground.copyContext = manifest["copyContext"];

      $.each(queryData, function(key, val){
        val = manifest[key];
        if(val){
          // is within this gist?
          if(val[0] === "."){
            var file = gist.files[val.slice(2)];
            if(!file.truncated){
              queryData[key] = JSON.parse(file.content);
              playground.setRemoteUrl(key, null);
            }else{
              deferreds.push($.get(file.raw_url).done(function(data){
                queryData[fieldName] = JSON.parse(data);
              }));
            }
          }else{
            playground.toggleRemote(key, true);
            var rval = playground.setRemoteUrl(key, val);
            if(rval){
              rval.then(function(data){
                queryData[fieldName] = data;
              });
              deferreds.push(rval);
            }
          }
        }
      });

      return deferreds.length ?
        $.when.apply($, deferreds).done(done) :
        done();
    }

    var gistId = new RegExp('^#/gist/(.*)').exec(window.location.hash);

    if(gistId){
      playground.gist(gistId[1]).done(handleGist);
      return;
    }

    // build deferreds
    var jsonLdDeferred = handleParameter(
      getParameterByName('json-ld'), 'markup', 'JSON-LD');

    var frameDeferred = handleParameter(
      getParameterByName('frame'), 'frame', 'frame');

    var contextDeferred = handleParameter(
      getParameterByName('context'), 'context', 'context');

    var paramDeferred = handleParameter(
      getParameterByName('param'), 'param', 'param');

    var startTab = getParameterByName('startTab');
    if(startTab) {
       $('#' + startTab).tab('show');
    }

    playground.copyContext = getParameterByName('copyContext') === "true";

    // wait for ajax if needed
    // failures handled in AJAX calls
    $.when(jsonLdDeferred, frameDeferred, contextDeferred, paramDeferred)
      .done(function() {
        // Maintain backwards permalink compatability
        if(queryData.param && !(queryData.frame || queryData.context)) {
          queryData.frame = queryData.context = queryData.param;
        }
        // populate UI with data
        playground.populateWithJSON(queryData);
      });
  };


  /**
   * Used to initialize the UI, call once on document load.
   */
  playground.init = function() {
    // options storage
    playground.options = {
      api: {
        // TODO: add other API options
        processingMode: '',
        compactArrays: true,
        compactToRelative: true
      }
    };

    // enable bootstrap tabs
    $('#input-tabs a,' +
      '#context-tabs a,' +
      '#frame-tabs a,' +
      '#privatekey-rsa-tabs a,' +
      '#privatekey-koblitz-tabs a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });
    $('#output-tabs a').click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    }).on("show", playground.tabSelected);

    // show keybaord shortcuts
    $('.popover-info').popover({
      placement: "left",
      html: true,
      content: $(".popover-info-content").html()
    });

    CodeMirror.commands.autocomplete = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.hint.jsonld, {
        lastParsed: playground.lastParsed[cm.options._playground_key],
        completeSingle: false,
        schemata: function(){
          return playground.schema ? [playground.schema] : [];
        }
      });
    };

    CodeMirror.commands.at_autocomplete = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.hint.jsonld, {
        isAt: true,
        completeSingle: false,
        lastParsed: playground.lastParsed[cm.options._playground_key],
        schemata: function(){
          return playground.schema ? [playground.schema] : [];
        }
      });
    };

    $(".codemirror-input").each(function(){ playground.init.editor(this); });
    $(".codemirror-output").each(function(){ playground.init.output(this); });

    playground.makeResizer($("#markup-container"), playground.editors);
    playground.makeResizer($("#output-container"), playground.outputs);

    $("#copy-context").click(function(){
      playground.toggleCopyContext();
    });

    $(".editor-option").each(function(){
      var option = $(this),
        key = option.data("editor");
      option.find("input").bind("input", function(){
        playground.setRemoteUrl(key, this.value);
      });
      option.find("button").bind("click", function(){
        playground.toggleRemote(key);
      });
    });

    // setup options
    $("#options-api-processingMode")[0].value =
      playground.options.api.processingMode;
    $("#options-api-compactArrays").prop(
      'checked', playground.options.api.compactArrays);
    $("#options-api-compactToRelative").prop(
      'checked', playground.options.api.compactToRelative);

    // process on option changes
    $("#options-api-processingMode").change(function(e) {
      playground.options.api.processingMode = e.target.value;
      playground.process();
    });
    $("#options-api-compactArrays").change(function(e) {
      playground.options.api.compactArrays = e.target.checked;
      playground.process();
    });
    $("#options-api-compactToRelative").change(function(e) {
      playground.options.api.compactToRelative = e.target.checked;
      playground.process();
    });

    $("[title]").tooltip();

    $(window).bind("hashchange", function(){
      if(window.location.href !== playground.permalink.url){
        playground.processQueryParameters();
        $("#permalink").popover("hide");
      }
    });

    // load the schema
    $.ajax({
        url: "/schemas/jsonld-schema.json",
        dataType: "json"
      })
      .done(function(schema){
        playground.schema = schema;
      })
      .fail(function(){
        console.warn("Schema could not be loaded. Schema validation disabled.");
      });

    if(window.location.search || window.location.hash) {
      playground.processQueryParameters();
    }
    $(".loading").fadeOut(function(){
      $(this).remove();
      $(".loaded").fadeIn();
      playground.editor.refresh();
      playground.editor.refresh(playground.outputs);
    });
  };


  /**
   * return a debounced copy of a function
   * thanks to @cwarden
   * https://github.com/cwarden/promising-debounce/blob/master/src/debounce.js
   *
   * @param a function
   * @param a number of milliseconds
   *
   * @return the function, which will only be called every `delay` milliseconds,
   *         which will then, in turn, return a $.Deferred
   */
  playground.debounce = function(fn, wait, immediate) {
    var timer = null;
    return function() {
      var context = this;
      var args = arguments;
      var resolve;
      var promise = new Promise(function(_resolve) {
        resolve = _resolve;
      }).then(function() {
        return fn.apply(context, args);
      });
      if(!!immediate && !timer) {
        resolve();
      }
      if(timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(function() {
        timer = null;
        if(!immediate) {
          resolve();
        }
      }, wait);
      return promise;
    };
  };


  /**
   * Initialize a CodeMirror editor
   *
   * @param a `<textarea>`
   *
   * @return the CodeMirror editor
   */
  playground.init.editor = function(node){
    var key = node.id;
    var editor;

    // don't use JSON-LD for PEM data
    if(key === 'privatekey-rsa' || key === 'privatekey-koblitz' ||
            key === 'publickey-koblitz') {
      editor = CodeMirror.fromTextArea(node, {
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: false,
        mode: 'text',
        theme: playground.theme,
        _playground_key: key
      });
    } else {
      editor = CodeMirror.fromTextArea(node, {
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        mode: "application/ld+json",
        gutters: ["CodeMirror-lint-markers"],
        theme: playground.theme,
        lintWith: {
          getAnnotations: CodeMirror.lint.jsonSchema,
          async: true,
          schemata: function(){
            return playground.schema ? [playground.schema] : [];
          }
        },
        extraKeys: {
          "Ctrl-Space": "autocomplete"
        },
        _playground_key: key
      });
    }

    playground.editors[key] = editor;

    // set up 'process' areas to process JSON-LD after typing
    editor.on("change", function(){
      if(playground.copyContext && key === "markup"){
        if(playground.toggleCopyContext.copy()){
          return;
        }
      }
      playground.process();
    });

    // check on every keyup for `@`: doesn't get caught by (extra|custom)Keys
    editor.on("keyup", function(editor, evt) {
      // these are the keys that move the cursor
      var noHint = [
        8, // backspace
        9, // hey! where's my tab?
        33, 34, 35, 46, // pg/home/end
        37, 38, 39, 40, // arrows
        12, // enter
        27 //escape
      ];

      if(noHint.indexOf(evt.keyCode) >= 0) { return; }

      var cursor = editor.getCursor(),
        token = editor.getTokenAt(cursor),
        chr = token.string[cursor.ch - token.start - 1];
      if(chr === "@") {
        CodeMirror.commands.at_autocomplete(editor, evt);
      }
    });

    return editor;
  };


  /**
   * Initialize a read-only CodeMirror viewer
   *
   * @param a `<textarea>`
   *
   * @return the CodeMirror editor
   */
  playground.init.output = function(node) {
    var key = node.id,
      output = playground.outputs[key] = CodeMirror.fromTextArea(node, {
        readOnly: true,
        lineWrapping: true,
        mode: ["normalized", "nquads"].indexOf(key) > -1 ?
          "text/n-triples" :
          "application/ld+json",
        theme: playground.theme
      });
    return output;
  };


  /**
   * Toggle whether the output context will be updated from the input
   *
   * @param the new value of the setting. If not provided, invert current
   *
   * @return the JSON that was actually set, or `undefined` if nothing was set
   */
  playground.toggleCopyContext = function(val){
    var editor = playground.editors.context;

    playground.copyContext =  val = arguments.length ?
      Boolean(val) :
      !playground.copyContext;

    playground.editor.setReadOnly(editor, val);

    setTimeout(function(){
      $("#copy-context").toggleClass("toggle", val);
    }, 1);

    if(val){
      return playground.toggleCopyContext.copy();
    }
  };


  /**
   * Copy the context right now.
   *
   * @return the JSON that was set, or `undefined` if nothing was set
   */
  playground.toggleCopyContext.copy = function(){
    var editor = playground.editors.context,
      json = playground.humanize({
        "@context": playground.lastParsed.markup ?
          playground.lastParsed.markup["@context"] :
          {}});
    if(json !== editor.getValue()){
      playground.editors.context.setValue(json);
      return json;
    }
  };


  /**
   * Set the remote URL for an editor, then fetch (if enabled).
   *
   * @param the key for the editor
   * @param the value
   *
   * @return jQuery deferred, or `undefined`
   */
  playground.setRemoteUrl = function(key, val){
    var opt = $("[data-editor=" + key + "]"),
      btn = opt.find("button"),
      inp = opt.find("input");

    playground.remoteUrl[key] = val ? val : null;

    if(inp.val() != val){
      inp.val(val);
    }

    // the button state is no longer valid
    btn.removeClass("btn-danger btn-info");

    return playground.fetchRemote(key);
  };


  /**
   * Toggle (or set) whether a remote document will be used for an editor.
   *
   * @param the key for the editor
   * @param the value: omit to toggle
   *
   * @return jQuery deferred, or `undefined`
   */
  playground.toggleRemote = function(key, val){
    var btn = $("[data-editor=" + key + "] button");

    playground.useRemote[key] = val = arguments.length === 2 ?
      Boolean(val) :
      !playground.useRemote[key];

    playground.editor.setReadOnly(key, val);

    // the button state is no longer valid
    setTimeout(function(){
      btn.removeClass("btn-danger btn-info" + (!val ? " active" : ""));
    }, 1);
    return playground.fetchRemote(key);
  };


  // Cache of fetched remote urls
  playground.fetchRemoteCache = {};
  playground.fetchRemoteFails = {};

  /**
   * Fetch a remote document and populate an editor.
   *
   * @param the key for the editor
   *
   * @return jQuery deferred, or `undefined`
   */
  playground.fetchRemote = playground._fetchRemote = function(key){
    if(!playground.useRemote[key]){ return; }

    var btn = $("[data-editor=" + key + "] button"),
      debounced = playground.fetchRemote !== playground._fetchRemote,
      url = playground.remoteUrl[key],
      hit = playground.fetchRemoteCache[url],
      fail = playground.fetchRemoteFails[url],
      success = function(data){
        playground.fetchRemoteCache[url] = data;
        btn.addClass("btn-info active");
        // setValue always triggers a .process()
        playground.editors[key].setValue(playground.humanize(data));
        playground.fetchRemote = playground._fetchRemote;
      },
      error = function(err) {
        playground.fetchRemoteFails[url] = err;
        btn.addClass("btn-danger active");
        $('#processing-errors')
          .text('Error loading ' + key + ' URL: ' + playground.remoteUrl[key])
          .show();

        playground.fetchRemote = debounced ?
          playground.fetchRemote :
          playground.debounce(playground._fetchRemote, 500);
      };

    return hit ? success(hit) :
      fail ? error(fail) :
      jsonld.documentLoader(url).then(function(remoteDoc) {
        /* Note: Do injection of Link header @context; this could possibly
        be done in a less obfuscated way (to the user) or use the expandContext
        API option, or better integrate debouncing in the remote document
        loader defined elsewhere. However, this approach was the least
        intrusive to do now to restore Link header functionality and has the
        advantage of allowing the document to be edited inline w/the
        injected @context. */
        if(remoteDoc.contextUrl) {
          // TODO: flash link header injection notice on UI
          if(Array.isArray(remoteDoc.document)) {
            remoteDoc.document = {
              '@context': remoteDoc.contextUrl,
              '@graph': remoteDoc.document
            };
          } else if(typeof remoteDoc.document === 'object') {
            // inject @context as first key
            var obj = {'@context': remoteDoc.contextUrl};
            for(var key in remoteDoc.document) {
              obj[key] = remoteDoc.document[key];
            }
            remoteDoc.document = obj;
          }
        }
        success(remoteDoc.document);
      }).catch(error);
  };


  /**
   * Make one or more editor resizeable together.
   *
   * @param parent the dom element to which the button should be attached
   * @param an object or list of CodeMirror instances to be resized together
   *
   * @return the resizer button DOM
   */
  playground.makeResizer = function(parent, targets){
    targets = $.map(targets, function(val){ return val; });
    var start_y,
      start_height,
      handlers = {},
      btn = $("<button/>", {"class": "btn resizer"})
        .mousedown(handlers.mousedown = function(evt){
          start_y = evt.screenY;
          start_height = targets[0].display.wrapper.clientHeight;
          $(window)
            .bind("mousemove.resizer", function(evt){
             targets.map(function(tgt){
                tgt.setSize(null, start_height - (start_y - evt.screenY));
              });
            })
            .bind("mouseup.resizer", function(){
              $(window).unbind(".resizer");
              btn.blur();
            });
        })
        .appendTo(parent);
    return btn[0];
  };


  /**
   * Namespace for editor functions, and utility for doing things against them
   *
   * @param a keyed object of editors, the name of an editor, an editor
   *        or a list of editors. or nothing, which assumes all of them.
   * @param the action to peform, of the form `function(editor, key)`
   *
   * @return the result of the action
   */
  playground.editor = function(editors, action){
    var key,
      editor;
    if($.type(editors) === "string"){
      key = editors;
      editors = {};
      editors[key] = playground.editors[key];
    }else if(editors instanceof CodeMirror){
      key = editors.getTextArea().id;
      editor = editors;
      editors = {};
      editors[key] = editor;
    }else if(!editors){
      editors = playground.editors;
    }
    return $.map(editors, action);
  };


  /**
   * Make a CodeMirror editor (temporarily) read-only.
   *
   * @param see `playground.editor`
   * @param whether the CodeMirror editor should be editable
   *
   * @return the new value of the read-only setting
   */
  playground.editor.setReadOnly = function(editors, value){
    value = Boolean(value);
    playground.editor(editors, function(editor){
      editor.setOption("readOnly", value);
      $(editor.getWrapperElement()).toggleClass("read-only", value);
    });
    return value;
  };


  /**
  * Refresh one or more CodeMirror editors, such as after being revealed.
  *
  * @param see `playground.editor`
  */
  playground.editor.refresh = function(editor){
    return playground.editor(editor, function(editor){
      editor.refresh();
    });
  };


  /**
   * Callback for when tabs are selected in the UI.
   *
   * @param event the event that fired when the tab was selected.
   *
   * @return the process() promise
   */
  playground.tabSelected = function(evt) {
    var id = playground.activeTab = evt.target.id;

    if(['tab-compacted', 'tab-flattened', 'tab-framed',
      'tab-signed-rsa', 'tab-signed-koblitz', ].indexOf(id) > -1) {
      // these options require more UI inputs, so compress UI space
      $('#markup-div').removeClass('span12').addClass('span6');
      $('#frame-div, #privatekey-rsa-div, #privatekey-koblitz-div, ' +
        '#context-div').hide();
      if(id === 'tab-compacted' || id === 'tab-flattened') {
        $('#param-type').html('JSON-LD Context');
        $('#context-div').show();
      } else if(id==='tab-framed') {
        $('#param-type').html('JSON-LD Frame');
        $('#frame-div').show();
      } else if(id === 'tab-signed-rsa') {
        $('#param-type').html('PEM-encoded Private Key');
        $('#privatekey-rsa-div').show();
      } else if(id === 'tab-signed-koblitz') {
        $('#param-type').html('Base 58 Encoded Private Key');
        $('#privatekey-koblitz-div').show();
      }
    }
    else {
      // else no input textarea required
      $('#context-div, #frame-div, #privatekey-rsa-div, ' +
        '#privatekey-koblitz-div').hide();
      $('#markup-div').removeClass('span6').addClass('span12');
      $('#param-type').html('');
    }

    // refresh all the editors
    playground.editor.refresh();
    playground.editor.refresh(playground.outputs);

    // perform processing on the data provided in the input boxes
    return playground.process();
  };


  /**
   * Returns a Promise to perform the JSON-LD API action based on the active
   * tab.
   *
   * @param input the JSON-LD object input or null no error.
   * @param param the JSON-LD param to use.
   *
   * @return a promise to perform the action
   */
  playground.performAction = function(input, param) {
    // set options
    var options = {
      // base IRI
      base: (playground.useRemote.markup && playground.remoteUrl.markup) ||
        document.baseURI || document.URL
    };
    if(playground.options.api.processingMode !== '') {
      options.processingMode = playground.options.api.processingMode;
    }
    options.compactArrays = playground.options.api.compactArrays;
    options.compactToRelative = playground.options.api.compactToRelative;

    var promise;
    if(playground.activeTab === 'tab-compacted') {
      promise = jsonld.compact(input, param, options);
    }
    else if(playground.activeTab === 'tab-expanded') {
      promise = jsonld.expand(input, options);
    }
    else if(playground.activeTab === 'tab-flattened') {
      promise = jsonld.flatten(input, param, options);
    }
    else if(playground.activeTab === 'tab-framed') {
      promise = jsonld.frame(input, param, options);
    }
    else if(playground.activeTab === 'tab-nquads') {
      options.format = 'application/n-quads';
      promise = jsonld.toRDF(input, options);
    }
    else if(playground.activeTab === 'tab-normalized') {
      options.format = 'application/n-quads';
      promise = jsonld.normalize(input, options);
    }
    else if(playground.activeTab === 'tab-table') {
      return jsonld.toRDF(input, options)
        .then(_datasetToTable($('#table tbody')));
    }
    else if(playground.activeTab === 'tab-visualized') {
      // early return because this isn't an editor
      return new Promise(function() {
        $('#visualized').empty();
        d3.jsonldVis(input, '#visualized');
      });
    }
    else if(playground.activeTab === 'tab-signed-rsa') {
      options.format = 'application/ld+json';

      var jsigs = window.jsigs || window['jsonld-signatures'];
      var pkey = playground.editors['privatekey-rsa'].getValue();

      var secCtx = jsigs.SECURITY_CONTEXT_URL;
      var algorithm;
      var newerJsigs = 'suites' in jsigs && 'RsaSignature2018' in jsigs.suites;
      // FIXME: remove when jsonld.js updated
      var v11Ctx = {'@version': 1.1};

      if(newerJsigs) {
        algorithm = 'RsaSignature2018';
      } else {
        algorithm = 'LinkedDataSignature2015';
      }

      // add security context to input
      if(!('@context' in input)) {
        input['@context'] = secCtx;
      } else if(Array.isArray(input['@context'])) {
        if(newerJsigs) {
          input['@context'].unshift(v11Ctx);
        }
        input['@context'].push(secCtx);
      } else {
        input['@context'] =
          [v11Ctx, input['@context'], secCtx];
      }

      promise = jsigs.promises.sign(input, {
        privateKeyPem: pkey,
        algorithm: algorithm,
        nonce: forge.util.bytesToHex(forge.random.getBytesSync(4)),
        domain: 'json-ld.org',
        creator: 'https://example.com/jdoe/keys/1'
      });
    }
    else if(playground.activeTab === 'tab-signed-koblitz') {
      options.format = 'application/ld+json';

      var jsigs = window.jsigs || window['jsonld-signatures'];
      var privateKey = playground.editors['privatekey-koblitz'].getValue().trim();

      // add security context to input
      if(!('@context' in input)) {
        input['@context'] = 'https://w3id.org/security/v1';
      } else if(Array.isArray(input['@context'])) {
        input['@context'].push('https://w3id.org/security/v1');
      } else {
        input['@context'] =
          [input['@context'], 'https://w3id.org/security/v1'];
      }

      var signed = null;
      var publicKeyFromPrivateKey;
      try {
        publicKeyFromPrivateKey = new bitcoreMessage.Bitcore.PrivateKey(privateKey).toPublicKey();
      } catch (e) {
        promise = Promise.reject(e)
      }

      promise = promise || jsigs.promises.sign(input, {
        privateKeyWif: privateKey,
        algorithm: 'EcdsaKoblitzSignature2016',
        creator: 'ecdsa-koblitz-pubkey:' + publicKeyFromPrivateKey
      }).then( function(_signed) {
        signed = _signed;
        var publicKey = playground.editors['publickey-koblitz'].getValue().trim();
        var verificationKey = {
          '@context': jsigs.SECURITY_CONTEXT_URL,
          id: 'ecdsa-koblitz-pubkey:' + publicKey,
          type: 'CryptographicKey',
          publicKeyWif: publicKey
        };
        var publicKeyBtcOwner = {
          '@context': jsigs.SECURITY_CONTEXT_URL,
          publicKey: [verificationKey]
        };
        return jsigs.promises.verify(signed, {
          publicKey: verificationKey,
          publicKeyOwner: publicKeyBtcOwner
        })
      }).then( function(verification) {
        if (verification) {
          $('#validation-message')
          .text('Signature validated successfully using this public key')
          .show();
        } else {
          $('#validation-errors')
          .text('Signature was NOT validated using this public key')
          .show();
        }
        return signed;
      }).catch( function(e) {
        console.error(e.stack)
        throw(e)
      });
    }
    else {
      promise = Promise.reject(new Error('Invalid tab selection.'));
    }

    return promise.then(function(result) {
      var outputTab = playground.activeTab.substr('tab-'.length);
      result = playground.humanize(result);
      playground.outputs[outputTab].setValue(result);
    });
  };

  var _datasetToTable = function(tbody) {
    return function(dataset) {
      tbody.empty();
      // simple sort, good enough for this purpose
      // FIXME: is this needed?
      dataset.sort(function(a, b) {
        if(a.graph.value !== b.graph.value) {
          return a.graph.value > b.graph.value;
        }
        if(a.subject.value !== b.subject.value) {
          return a.subject.value > b.subject.value;
        }
        if(a.predicate.value !== b.predicate.value) {
          return a.predicate.value > b.predicate.value;
        }
        return a.object.value > b.object.value;
      });
      dataset.forEach(function(quad) {
        tbody.append(_tableRow(quad));
      });
    };
  };

  var RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
  var RDF_LANGSTRING = RDF + 'langString';
  var XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';

  var _tableRow = function(quad) {
    var g = quad.graph;
    var s = quad.subject;
    var p = quad.predicate;
    var o = quad.object;

    var row = $('<tr>');

    // subject (IRI)
    var td = $('<td>');
    if(s.termType === 'NamedNode') {
      var a = $('<a>').attr('href', s.value).text(s.value);
      td.append(a);
    } else {
      td.text(s.value);
    }
    row.append(td);

    // predicate (IRI)
    td = $('<td>');
    if(p.termType === 'NamedNode') {
      var a = $('<a>').attr('href', p.value).text(p.value);
      td.append(a);
    } else {
      td.text(p.value);
    }
    row.append(td);

    // object (IRI, bnode, or literal)
    if(o.termType === 'NamedNode') {
      var a = $('<a>').attr('href', o.value).text(o.value);
      row.append($('<td>').append(a));
      row.append($('<td>'));
      row.append($('<td>'));
    } else if(o.termType === 'BlankNode') {
      row.append($('<td>').text(o.value));
      row.append($('<td>'));
      row.append($('<td>'));
    } else {
      row.append($('<td>').text(o.value));
      if(o.datatype.value === RDF_LANGSTRING) {
        if(o.language) {
          row.append($('<td>').text(o.language));
        } else {
          row.append($('<td>'));
        }
        row.append($('<td>'));
      } else if(o.datatype.value !== XSD_STRING) {
        row.append($('<td>'));
        var a = $('<a>').attr('href', o.datatype.value).text(o.datatype.value);
        row.append($('<td>').append(a));
      } else {
        row.append($('<td>'));
        row.append($('<td>'));
      }
    }
    /*
    td = $('<td>');
    if(o.type === 'IRI') {
      var a = $('<a>').attr('href', o.value).text(o.value);
      td.append(a);
    } else if(o.termType === 'BlankNode') {
      td.text(o.value);
    } else {
      var t = o.value;
      if(o.datatype === RDF_LANGSTRING) {
        if(o.language) {
          t += '@' + o.language;
        }
      } else if(o.datatype !== XSD_STRING) {
        t += '^^<' + o.datatype + '>';
      }
      td.text(t);
    }
    row.append(td);
    */

    // TODO: ad lang and datatype columns?

    // graph (null, IRI, bnode)
    td = $('<td>');
    if(g.value !== '') {
      if(g.value.indexOf('_:') !== 0) {
        var a = $('<a>').attr('href', g.value).text(g.value);
        td.append(a);
      } else {
        td.text(g.value);
      }
    }
    row.append(td);

    return row;
  };

  /**
   * Process the JSON-LD markup that has been input and display the output
   * in the active tab.
   *
   * @return a promise to process
   */
  playground.process = playground._process = function(){
    $('#markup-errors').hide().empty();
    $('#param-errors').hide().empty();
    $('#validation-errors').hide().empty();
    $('#validation-message').hide().empty();
    $('#processing-errors').hide().empty();
    $('#using-context-map').hide();
    $('#using-context-map table tbody').empty();
    playground.activeContextMap = {};
    var errors = false;
    var markup = playground.editors.markup.getValue();
    var input;

    // nothing to process
    if(markup === '') {
      return;
    }

    // check to see if the JSON-LD markup is valid JSON
    try {
      input = playground.lastParsed.markup = JSON.parse(markup);
    }
    catch(e) {
      $('#markup-errors')
        .text('JSON markup - ' + e)
        .show();
      errors = true;
    }

    // If we're using a param, check to see if it is valid JSON
    var needParam = false;
    var param = null;
    var jsonParam = null;
    var paramType = null;

    if(playground.activeTab === 'tab-compacted' ||
      playground.activeTab === 'tab-flattened') {
      jsonParam = playground.editors.context.getValue();
      needParam = true;
      paramType = "context";
    }
    else if(playground.activeTab === 'tab-framed') {
      jsonParam = playground.editors.frame.getValue();
      needParam = true;
      paramType = "frame";
    }

    if(needParam) {
      try {
        playground.lastParsed[paramType] = param = JSON.parse(jsonParam);
      }
      catch(e) {
        $('#param-errors')
          .text($('#param-type').text() + ' - ' + e)
          .show();
        errors = true;
      }
    }

    var debounced = playground.process !== playground._process;

    // no errors, perform the action and display the output
    return playground.performAction(input, param)
      .then(
        function(){
          playground.permalink();
          playground.process = playground._process;
        },
        function(err){
          // FIXME: add better error handling output
          console.error(err);
          $('#processing-errors')
            .append('Processing error:')
            .append(
              $('<pre>').text(playground.humanize(err)))
            .show();
          playground.permalink(err);
          playground.process = debounced ?
            playground.process :
            playground.debounce(playground._process, 500);
          return err;
        }
      );
  };

  playground.gist = function(gistId, description){
    var gistUrl = "https://api.github.com/gists";

    if(gistId){
      var xhr = $.get(gistUrl + "/" + gistId);

      playground.lastGist = null;

      xhr.done(function(gist){
        playground.lastGist = gist;
      });

      return xhr;
    }else{
      var files = {
          "README.md": {
            content:
              "# " + description + "\n\n" +
              "> This gist was automatically created by the [JSON-LD" +
              " Playground](http://json-ld.org/playground). You can see it" +
              " loaded there by visiting:\n" +
              "```\nhttp://json-ld.org/playground#/gist/<gist id>\n```"
          }
        },
        manifest = {
          "@context": {
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            playground: "http://json-ld.org/playground#",

            description: "rdfs:label",

            startTab: "playground:startTab",
            copyContext: "playground:copyContext",

            markup: {"@id": "playground:markup", "@type": "@id"},
            context: {"@id": "playground:context", "@type": "@id"},
            frame: {"@id": "playground:frame", "@type": "@id"}
          },
          "description": description,
          "startTab": playground.activeTab,
          "copyContext": playground.copyContext
        };

      // check the editors for inputs/remotes
      $.each(playground.editors, function(key){
        if(key === "context" && playground.copyContext){ return; }
        if(playground.useRemote[key]){
          manifest[key] = playground.remoteUrl[key];
        }else if(playground.lastParsed[key]){
          manifest[key] = "./" + key + ".jsonld";
          files[key + ".jsonld"] = {
            content: playground.humanize(playground.lastParsed[key])
          };
        }
      });

      files["playground.jsonld"] = {
        content: playground.humanize(manifest)
      };

      var gist = {
        description: "JSON-LD Playground: " + description,
        public: true,
        files: files
      };

      return $.ajax({
        type: "POST",
        url: gistUrl,
        contentType: "application/json",
        dataType: "json",
        data: playground.humanize(gist)
      });
    }
  };

  playground.gist.title = function(){
    return $("<div/>").text("Gist");
  };

  playground.gist.content = function(){
    var content = $("<div/>").css({width: 320});


    content.append($("<p/>").text("Try to load a gist into the playground."));

    var idWrap = $("<div/>", {"class": "input-append"})
      .appendTo(content);

    content.append($("<p/>").text(
      "Create a public forkable, commentable version of the current playground configuration."
    ));

    var descWrap = $("<div/>", {"class": "input-append"})
      .appendTo(content);

    var gistId = $("<input/>", {
          "type": "text",
          "placeholder": "<gist id> or <user>/<gist id>"
        })
        .appendTo(idWrap),

      gistDesc = $("<input/>", {
          "type": "text",
          "placeholder": "New Gist description"
        })
        .appendTo(descWrap);

    $("<button/>", {"class": "btn btn-info"})
      .css({width: 100})
      .append(
        $("<i/>", {"class": "icon icon-cloud-download pull-left"}),
        $("<span/>").text("Load")
      )
      .click(function(){
        playground.gist(gistId.val()).done(function(gist){
          gistDesc.val(gist.description);
          window.location.hash = "/gist/" + gist.id;
        });
      })
      .appendTo(idWrap);

    $("<button/>", {"class": "btn btn-primary"})
      .css({width: 100})
      .append(
        $("<i/>", {"class": "icon icon-cloud-upload pull-left"}),
        $("<span/>").text("Create")
      )
      .click(function(){
        playground.gist(null, gistDesc.val()).done(function(gist){
          gistDesc.val(null);
          gistId.val(gist.id);
        });
      })
      .appendTo(descWrap);

    return content;
  };

  /**
   * Update the permalink button with a `#` link to the current playground
   *
   * @param the error object, string or object
   *
   * @return the current permalink URL
   */
  playground.permalink = function(errors) {
    // generate a hash link for current data, starting with the tab
    var hash = "",
      params = {
        startTab: playground.activeTab,
        copyContext: playground.copyContext
      },
      val,
      messages;

    // check the editors for inputs/remotes
    $.each(playground.editors, function(key){
      if(key === "context" && params.copyContext){ return; }
      val = playground.useRemote[key] ? playground.remoteUrl[key] : null;
      val = val ? val : JSON.stringify(playground.lastParsed[key]);
      if(val && val !== "null"){
        params[key] = val;
      }
    });

    // encode and concat the hash components
    $.each(params, function(key, val){
      if(!val){ return; }
      hash += (hash ? "&" : "#") +
        (key === "markup" ? "json-ld" : key) + "=" + encodeURIComponent(val);
    });

    playground.permalink.url = window.location.href.replace(/[#\?].*$/, "") +
      hash;

    messages = {
      danger: errors === void 0 ? "" :
        "This link will show the current errors.",
      warning: playground.permalink.url.length < 2048 ? "" :
        "This link is longer than 2kb, and may not work."
    };

    $("#permalink")
      .popover("hide")
      .attr({href: playground.permalink.url})
      .removeClass("hide")
      .toggleClass("btn-danger", messages.danger.length !== 0)
      .toggleClass("btn-warning", messages.warning.length !== 0)
    .find("span")
      .text("Permalink");

    return playground.permalink.url;
  };

  playground.permalink.title = function(){
    var title = $("<span/>");
    title.append(
      $("<span/>").text("Share this "),
      $("<a/>", {
        href: "http://tinyurl.com/create.php?url=" +
            playground.permalink.url.replace(/#/, "?"),
          target: "_blank",
          "class": "pull-right"
      }).text("Shorten"));
    return title[0];
  };

  playground.permalink.content = function(){
    var tip = $("<p/>"),
      inp = $("<input/>", {
        "class": "span2",
        autofocus: true
      })
      .val(playground.permalink.url);
    tip.append(inp);

    setTimeout(function(){
      inp[0].select();
    });

    return tip[0];
  };


  /**
   * Populate the UI with markup, frame, and context JSON. The data parameter
   * should have a 'markup' field and optional 'frame' and 'context' fields.
   *
   * @param data object with optional 'markup', 'frame' and 'context' fields.
   *
   * @return the process promise, or `undefined` if no data was found
   */
  playground.populateWithJSON = function(data) {
    var hasData = false;

    $.each(playground.editors, function(key, editor){
      if(key in data && data[key] !== null){
        hasData = true;
        editor.setValue(playground.humanize(data[key]));
      }else{
        if(key !== 'privatekey-rsa' && key !== 'privatekey-koblitz' &&
                key !== 'publickey-koblitz') {
          editor.setValue("{}");
        }
      }
    });

    if(playground.copyContext){
      playground.toggleCopyContext(true);
    }

    if(hasData) {
      // perform processing on the data provided in the input boxes
      return playground.process();
    }
  };


  /**
   * Populate the UI with a named example.
   *
   * @param name the name of the example to pre-populate the input boxes.
   *
   * @return a promise to process the data, or `undefined`
   */
  playground.populateWithExample = function(name) {
    var data = docs();

    if(name in playground.examples) {
      // fill the markup with the example
      data.markup = playground.examples[name];

      if(name in playground.frames) {
        // fill the frame with the example
        data.frame = playground.frames[name];
      }

      if(name in playground.contexts) {
        // fill the context with the example
        data.contexts = playground.contexts[name];
      }
      else if('@context' in playground.examples[name]) {
        // use context from markup as default
        data.context = { '@context': playground.examples[name]['@context'] };
      }
    }

    // clean up any remote URLs
    $.each(playground.editors, function(key){
      playground.toggleRemote(key, false);
      playground.setRemoteUrl(key, null);
    });
    playground.toggleCopyContext(false);

    // populate with the example
    return playground.populateWithJSON(data);
  };


  // event handlers
  $(document).ready(function() {
    // Add custom document loader that uses a context URL map.
    var xhrDocumentLoader = jsonld.documentLoaders.xhr();
    // FIXME: add UI to let users control and set context mapping
    jsonld.documentLoader = function(url) {
      if(url in playground.contextMap) {
        $('#using-context-map').show();
        var modified = playground.contextMap[url];
        if(!(modified in playground.activeContextMap)) {
          var row = $('<tr>')
            .append('<td>' + url + '</td>')
            .append('<td>' + modified + '</td>');
          $('#using-context-map table tbody').append(row);
          playground.activeContextMap[url] = modified;
        }

        if($('#use-context-map').prop('checked')) {
          url = modified;
        }
      }
      // rewrite URLs that we know have secure JSON-LD Contexts
      if(url === 'http://schema.org/') {
        url = 'https://schema.org/';
      }

      // if a non-HTTPS URL, use the proxy since we run in HTTPS only mode
      if(!url.startsWith('https://')) {
        url = [
          location.protocol,
          '//',
          location.host,
          // NOTE: using hard-coded path so file can be shared with dev page
          //location.pathname,
          '/playground/',
          'proxy.php?url=',
          url
        ].join('');
      }

      return xhrDocumentLoader(url);
    };

    // set up buttons to load examples
    $('.button').each(function() {
      var button = $(this);
      button.click(function() {
        playground.populateWithExample(button.find('span').text());
      });
    });

    $('#use-context-map').change(function() {
      playground.process();
    });

    $("#permalink").popover({
      placement: "left",
      title: playground.permalink.title,
      content: playground.permalink.content,
      html: true
    });

    $("#gist").popover({
      placement: "left",
      title: playground.gist.title,
      content: playground.gist.content,
      html: true
    });
  });
  return playground;
}).call(this, this.jQuery, this.CodeMirror, this.jsonld, this.Promise);
