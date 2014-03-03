/**
 * The JSON-LD playground is used to test out JavaScript Object Notation
 * for Linked Data.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 * @author Nicholas Bollweg
 * @author Markus Lanthaler
 */
(function($) {
  // create the playground instance if it doesn't already exist
  window.playground = window.playground || {};
  var playground = window.playground;

  // the codemirror editors
  playground.editors = {};

  // ... and outputs
  playground.outputs = {};

  // default theme
  playground.theme = "neat";

  // the last parsed version of same
  playground.lastParsed = {
    markup: null,
    frame: null,
    context: null
  };

  // set the active tab to the expanded view
  playground.activeTab = 'tab-expanded';

  // map of original to modifed contexts
  playground.contextMap = {
    // FIXME: remove schema.org support once they serve a JSON-LD context
    'http://schema.org': 'https://w3id.org/schema.org',
    'http://schema.org/': 'https://w3id.org/schema.org'
  };

  // map of currently active mapped contexts for user feedback use
  playground.activeContextMap = {};

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
    var match = RegExp('[?&]' + name + '=([^&]*)')
      .exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  };

  /**
   * Consistent human-readable JSON formatting.
   *
   * @param the object or string to humanize.
   *
   * @return a string containing the humanized string.
   */
  playground.humanize = function(value) {
    return ($.type(value) === 'string')
      ? value
      : JSON.stringify(value, null, 2);
  };

  /**
   * Handle URL query parameters.
   *
   * Checks 'json-ld', 'context', and 'frame' parameters.  If they look like
   * JSON then interpret as JSON strings else interpret as URLs of remote
   * resources.  Note: URLs must be CORS enabled to load due to browser same
   * origin policy issues.
   *
   * If 'startTab' is present, select that tab automatically.
   */
  playground.processQueryParameters = function() {
    // data from the query
    var queryData = {
      markup: null,
      frame: null,
      context: null
    };

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
    function handleParameter(param, fieldName, msgName) {
      // the ajax deferred or null
      var rval = null;

      // check 'json-ld' parameter
      if(param !== null) {
        if(param.length === 0 || param[0] === '{' || param[0] === '[') {
          // param looks like JSON, try to parse it
          try {
            queryData[fieldName] = JSON.parse(param);
          }
          catch(e) {
            queryData[fieldName] = param;
          }
        }
        else {
          // treat param as a URL
          rval = $.ajax({
            url: param,
            dataType: 'text',
            crossDomain: true,
            success: function(data, textStatus, jqXHR) {
               queryData[fieldName] = data;
            },
            error: function(jqXHR, textStatus, errorThrown) {
               // FIXME: better error handling
               $('#processing-errors')
                  .text('Error loading ' + msgName + ' URL: ' + param);
            }
          });
        }
      };

      return rval;
    };

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

    // wait for ajax if needed
    // failures handled in AJAX calls
    $.when(jsonLdDeferred, frameDeferred, contextDeferred, paramDeferred)
      .done(function() {
        // Maintain backwards permalink compatability
        if(queryData['param'] &&
          !(queryData['frame'] || queryData['context'])) {
          queryData['frame'] = queryData['context'] = queryData['param'];
        }
        // populate UI with data
        playground.populateWithJSON(queryData);
      });
  };

  /**
   * Used to initialize the UI, call once on document load.
   */
  playground.init = function() {
    // enable bootstrap tabs
    $('#tabs a').click(function (e) {
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
        lastParsed: playground.lastParsed[cm.options._playground_key]
      });
    };

    CodeMirror.commands.at_autocomplete = function(cm) {
      CodeMirror.showHint(cm, CodeMirror.hint.jsonld, {
        isAt: true,
        lastParsed: playground.lastParsed[cm.options._playground_key]
      });
    };

    $(".codemirror-input").each(playground.init.editor);
    $(".codemirror-output").each(playground.init.output);
    playground.makeResizer($("#markup-container"), playground.editors);
    playground.makeResizer($("#output-container"), playground.outputs);

    if(window.location.search) {
      playground.processQueryParameters();
    }
  };

  playground.init.editor = function(){
    var key = this.id,
      editor = playground.editors[key] = CodeMirror.fromTextArea(this, {
        matchBrackets: true,
        autoCloseBrackets: true,
        lineWrapping: true,
        mode: "application/ld+json",
        gutters: ["CodeMirror-lint-markers"],
        theme: playground.theme,
        lint: true,
        extraKeys: {
          "Ctrl-Space": "autocomplete"
        },
        _playground_key: key
      });

    // set up 'process' areas to process JSON-LD after typing
    editor.on("change", playground.process);

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
  };

  playground.init.output = function() {
    var key = this.id,
      output = playground.outputs[key] = CodeMirror.fromTextArea(this, {
        readOnly: true,
        lineWrapping: true,
        mode: ["normalized", "nquads"].indexOf(key) > -1
          ? "text/n-triples"
          : "application/ld+json",
        theme: playground.theme
      });
  };

  /**
   * Make one or more CodeMirror editor resizeable.
   *
   * @param parent the dom element to which the button should be attached
   * @param target the CodeMirror instances to be resized
   */
  playground.makeResizer = function(parent, targets){
    targets = $.map(targets, function(val, key){ return val; });
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
  };

  /**
   * Callback for when tabs are selected in the UI.
   *
   * @param event the event that fired when the tab was selected.
   */
  playground.tabSelected = function(evt) {

    var id = playground.activeTab = evt.target.id;

    if(['tab-compacted', 'tab-flattened', 'tab-framed'].indexOf(id) > -1) {
      // these options require more UI inputs, so compress UI space
     $('#markup-div').removeClass('span12').addClass('span6');

      if(id !== 'tab-framed') {
        $('#param-type').html('JSON-LD Context');
        $('#context-div').show();
        $('#frame-div').hide();
      }
      else {
        $('#param-type').html('JSON-LD Frame');
        $('#frame-div').show();
        $('#context-div').hide();
      }
    }
    else {
      // else no input textarea required
      $('#context-div, #frame-div').hide();
      $('#markup-div').removeClass('span6').addClass('span12');
      $('#param-type').html('');
    }

    $.each(playground.editors, function(id, editor){ editor.refresh(); });

    // perform processing on the data provided in the input boxes
    playground.process();
  };

  /**
   * Returns a Promise to performs the JSON-LD API action based on the active
   * tab.
   *
   * @param input the JSON-LD object input or null no error.
   * @param param the JSON-LD param to use.
   */
  playground.performAction = function(input, param) {
    var processor = new jsonld.JsonLdProcessor();

    // set base IRI
    var options = {base: (document.baseURI || document.URL)};

    var promise;
    if(playground.activeTab === 'tab-compacted') {
      promise = processor.compact(input, param, options);
    }
    else if(playground.activeTab === 'tab-expanded') {
      promise = processor.expand(input, options);
    }
    else if(playground.activeTab === 'tab-flattened') {
      promise = processor.flatten(input, param, options);
    }
    else if(playground.activeTab === 'tab-framed') {
      promise = processor.frame(input, param, options);
    }
    else if(playground.activeTab === 'tab-nquads') {
      options.format = 'application/nquads';
      promise = processor.toRDF(input, options);
    }
    else if(playground.activeTab === 'tab-normalized') {
      options.format = 'application/nquads';
      promise = processor.normalize(input, options);
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

  /**
   * Process the JSON-LD markup that has been input and display the output
   * in the active tab.
   */
  playground.process = function() {
    $('#markup-errors').text('');
    $('#param-errors').text('');
    $('#processing-errors').text('');
    $('#using-context-map').hide();
    $('#using-context-map table tbody').empty();
    playground.activeContextMap = {};
    var errors = false;
    var markup = playground.editors.markup.getValue();

    // nothing to process
    if(markup === '') {
      return;
    }

    // check to see if the JSON-LD markup is valid JSON
    try {
      var input = JSON.parse(markup);
      playground.lastParsed.markup = input;
    }
    catch(e) {
      $('#markup-errors').text('JSON markup - ' + e);
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
        param = JSON.parse(jsonParam);
        playground.lastParsed[paramType] = param;
      }
      catch(e) {
        $('#param-errors').text($('#param-type').text() + ' - ' + e);
        errors = true;
      }
    }

    // errors detected
    if(errors) {
      $('#permalink').hide();
      return;
    }

    // no errors, perform the action and display the output
    playground.performAction(input, param).then(function() {
      // generate a link for current data
      var link = '?json-ld=' + encodeURIComponent(JSON.stringify(input));
      if(playground.editors.frame.getValue().length > 0) {
        link += '&frame=' + encodeURIComponent(playground.editors.frame.getValue());
      }
      if(playground.editors.context.getValue().length > 0) {
        link += '&context=' + encodeURIComponent(playground.editors.context.getValue());
      }

      // Start at the currently active tab
      link += '&startTab=' + encodeURIComponent(playground.activeTab);

      var permalink = '<a href="' + link + '">permalink</a>';
      // size warning for huge links
      if((window.location.protocol.length + 2 +
        window.location.host.length + window.location.pathname.length +
        link.length) > 2048) {
        permalink += ' (2KB+)';
      }
      $('#permalink')
        .html(permalink)
        .show();
    }, function(err) {
      // FIXME: add better error handling output
      $('#processing-errors').text(JSON.stringify(err));
    });
  };

  /**
   * Populate the UI with markup, frame, and context JSON. The data parameter
   * should have a 'markup' field and optional 'frame' and 'context' fields.
   *
   * @param data object with optional 'markup', 'frame' and 'context' fields.
   */
  playground.populateWithJSON = function(data) {
    var hasData = false;

    if('markup' in data && data.markup !== null) {
      hasData = true;
      // fill the markup box with the example
      playground.editors.markup.setValue(playground.humanize(data.markup));
    }

    if('frame' in data && data.frame !== null) {
      hasData = true;
      // fill the frame input box with the given frame
      playground.editors.frame.setValue(playground.humanize(data.frame));
    }
    else {
      playground.editors.frame.setValue('{}');
    }

    if('context' in data && data.context !== null) {
      hasData = true;
      // fill the context input box with the given context
      playground.editors.context.setValue(playground.humanize(data.context));
    }
    else {
      playground.editors.context.setValue('{}');
    }

    if(hasData) {
      // perform processing on the data provided in the input boxes
      playground.process();
    }
  };

  /**
   * Populate the UI with a named example.
   *
   * @param name the name of the example to pre-populate the input boxes.
   */
  playground.populateWithExample = function(name) {
    var data = {
      markup: null,
      context: null,
      frame: null
    };

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

    // populate with the example
    playground.populateWithJSON(data);
  };

  // event handlers
  $(document).ready(function() {
    // Add custom document loader that uses a context URL map.
    var jqueryDocumentLoader = jsonld.documentLoaders.jquery($);
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
      return jqueryDocumentLoader(url);
    };

    // set up buttons to load examples
    $('.button').each(function(idx) {
      var button = $(this);
      button.click(function() {
        playground.populateWithExample(button.find('span').text());
      });
    });

    $('#use-context-map').change(function() {
      playground.process();
    });

    $('#theme-select a').click(function(evt) {
      var theme = evt.currentTarget.text,
        file = evt.currentTarget.title ? evt.currentTarget.title : theme,
        key;

      $("#theme-name").text(theme);

      $('#theme-stylesheet').prop("href",
        "//cdnjs.cloudflare.com/ajax/libs/codemirror/3.16.0/theme/" +
        file + ".css"
      );

      for(key in playground.editors) {
        playground.editors[key].setOption("theme", theme);
      }

      for(key in playground.outputs) {
        playground.outputs[key].setOption("theme", theme);
      }
    });
  });
})(jQuery);
