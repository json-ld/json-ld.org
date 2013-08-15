/**
 * The JSON-LD playground is used to test out JavaScript Object Notation
 * for Linked Data.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 */
(function($) {
  // create the playground instance if it doesn't already exist
  window.playground = window.playground || {};
  var playground = window.playground;

  // set the active tab to the compacted view
  playground.activeTab = 'tab-compacted';

  // the counter is used to throttle colorization requests in milliseconds
  playground.colorizeDelay = 500;

  // the colorize timeout is used to keep track of the timeout object of the
  // colorize delay
  playground.colorizeTimeout = null;

  // map of original to modifed contexts
  playground.contextMap = {
    // FIXME: remove schema.org support once they serve a JSON-LD context
    'http://schema.org': 'https://w3id.org/schema.org',
    'http://schema.org/': 'https://w3id.org/schema.org'
  };

  // map of currently active mapped contexts for user feedback use
  playground.activeContextMap = {};

  /**
   * Escapes text that will affect HTML markup.
   *
   * @param text the string to re-encode as HTML.
   */
  playground.htmlEscape = function(text) {
    // replace each special HTML character in the string
    return text.replace(/([&<>])/g, function (c) {
      return '&' + {'&': 'amp', '<': 'lt', '>': 'gt'}[c] + ';';
    });
  };

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
          // param looks like JSON
          queryData[fieldName] = param;
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
      // strip 'tab-' to get the tab's panel's ID
      $('#tabs').tabs('select', '#' + startTab.substr(4));
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
    $('#tabs').tabs();
    $('#tabs').bind('tabsselect', playground.tabSelected);
    if(window.location.search) {
      playground.processQueryParameters();
    }
  };

  /**
   * Callback for when tabs are selected in the UI.
   *
   * @param event the event that fired when the tab was selected.
   * @param ui the ui tab object that was selected
   */
  playground.tabSelected = function(event, ui) {
    playground.activeTab = ui.tab.id;
    if(ui.tab.id === 'tab-compacted' || ui.tab.id === 'tab-flattened' ||
      ui.tab.id === 'tab-framed') {
      // these options require more UI inputs, so compress UI space
     $('#markup').addClass('compressed');
     $('#markup').removeClass('span12');
     $('#markup').addClass('span6');

      if(ui.tab.id === 'tab-compacted' || ui.tab.id === 'tab-flattened') {
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
      $('#context-div').hide();
      $('#frame-div').hide();
      $('#markup-div').removeClass('compressed');
      $('#markup').removeClass('span6');
      $('#markup').addClass('span12');
      $('#param-type').html('');
    }

    // perform processing on the data provided in the input boxes
    playground.process();

    // apply the syntax colorization
    prettyPrint();
  };

  /**
   * Returns a Promise to performs the JSON-LD API action based on the active
   * tab.
   *
   * @param input the JSON-LD object input or null no error.
   * @param param the JSON-LD param to use.
   */
  playground.performAction = function(input, param) {
    return new Promise(function(resolver) {
      var processor = new jsonld.JsonLdProcessor();

      // set base IRI
      var options = {base: document.baseURI};

      if(playground.activeTab === 'tab-compacted') {
        processor.compact(input, param, options).then(function(compacted) {
          $('#compacted').html(js_beautify(
            playground.htmlEscape(JSON.stringify(compacted)),
            {'indent_size': 2}).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
      else if(playground.activeTab === 'tab-expanded') {
        processor.expand(input, options).then(function(expanded) {
          $('#expanded').html(js_beautify(
            playground.htmlEscape(JSON.stringify(expanded)),
            {'indent_size': 2}).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
      else if(playground.activeTab === 'tab-flattened') {
        processor.flatten(input, param, options).then(function(flattened) {
          $('#flattened').html(js_beautify(
            playground.htmlEscape(JSON.stringify(flattened)),
            {'indent_size': 2}).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
      else if(playground.activeTab === 'tab-framed') {
        processor.frame(input, param, options).then(function(framed) {
          $('#framed').html(js_beautify(
            playground.htmlEscape(JSON.stringify(framed)),
            {'indent_size': 2}).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
      else if(playground.activeTab === 'tab-nquads') {
        options.format = 'application/nquads';
        processor.toRDF(input, options).then(function(nquads) {
          $('#nquads').html(
            playground.htmlEscape(nquads).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
      else if(playground.activeTab === 'tab-normalized') {
        options.format = 'application/nquads';
        processor.normalize(input, options).then(function(normalized) {
          $('#normalized').html(
            playground.htmlEscape(normalized).replace(/\n/g, '<br>'));
          resolver.resolve();
        }, resolver.reject);
      }
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
    var markup = $('#markup').val();

    // nothing to process
    if(markup === '') {
      return;
    }

    // check to see if the JSON-LD markup is valid JSON
    try {
      var input = JSON.parse(markup);
    }
    catch(e) {
      $('#markup-errors').text('JSON markup - ' + e);
      errors = true;
    }

    // If we're using a param, check to see if it is valid JSON
    var needParam = false;
    var param = null;
    var jsonParam = null;

    if(playground.activeTab === 'tab-compacted' ||
      playground.activeTab === 'tab-flattened') {
      jsonParam = $('#context').val();
      needParam = true;
    }
    else if(playground.activeTab === 'tab-framed') {
      jsonParam = $('#frame').val();
      needParam = true;
    }

    if(needParam) {
      try {
        param = JSON.parse(jsonParam);
      }
      catch(e) {
        $('#param-errors').text($('#param-type').text() + ' - ' + e);
        errors = true;
      }
    }

    // errors detected
    if(errors) {
      $('#permalink').hide();

      // start the colorization delay
      playground.checkColorizeDelay(true);
      return;
    }

    // no errors, perform the action and display the output
    playground.performAction(input, param).then(function() {
      // generate a link for current data
      var link = '?json-ld=' + encodeURIComponent(JSON.stringify(input));
      if($('#frame').val().length > 0) {
        link += '&frame=' + encodeURIComponent($('#frame').val());
      }
      if($('#context').val().length > 0) {
        link += '&context=' + encodeURIComponent($('#context').val());
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

      // start the colorization delay
      playground.checkColorizeDelay(true);
    }, function(err) {
      // FIXME: add better error handling output
      $('#processing-errors').text(JSON.stringify(err));
    });
  };

  /**
   * Performs a check on the colorize delay. If the delay hits 0, the
   * markup is colorized.
   *
   * @param reset true if the colorization timeout should be reset
   */
  playground.checkColorizeDelay = function(reset) {
    // if the counter reset flag is set, reset the counter
    if(reset) {
      playground.colorizeDelay = 500;
    }
    else {
      playground.colorizeDelay -= 250;
    }

    if(playground.colorizeDelay <= 0) {
      // if the delay has expired, perform colorization
      prettyPrint();
    }
    else {
      // if the delay has not expired, continue counting down
      if(playground.colorizeTimeout) {
        clearTimeout(playground.colorizeTimeout);
      }
      playground.colorizeTimeout =
        setTimeout(playground.checkColorizeDelay, 250);
    }
  };

  /**
   * Populate the UI with markup, frame, and context JSON. The data parameter
   * should have a 'markup' field and optional 'frame' and 'context' fields
   * that contain a serialized JSON string.
   *
   * @param data object with optional 'markup', 'frame' and 'context' fields.
   */
  playground.populateWithJSON = function(data) {
    var hasData = false;

    if('markup' in data && data.markup !== null) {
      hasData = true;
      // fill the markup box with the example
      $('#markup').val(js_beautify(
        data.markup, {'indent_size': 2, 'brace_style': 'expand'}));
    }

    if('frame' in data && data.frame !== null) {
      hasData = true;
      // fill the frame input box with the given frame
      $('#frame').val(js_beautify(
        data.frame, {'indent_size': 2, 'brace_style': 'expand'}));
    }
    else {
      $('#frame').val('{}');
    }

    if('context' in data && data.context !== null) {
      hasData = true;
      // fill the context input box with the given context
      $('#context').val(js_beautify(
        data.context, {'indent_size': 2, 'brace_style': 'expand'}));
    }
    else {
      $('#context').val('{}');
    }

    if(hasData) {
      // perform processing on the data provided in the input boxes
      playground.process();

      // apply the syntax colorization
      prettyPrint();
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
      data.markup = JSON.stringify(playground.examples[name]);

      if(name in playground.frames) {
        // fill the frame with the example
        data.frame = JSON.stringify(playground.frames[name]);
      }

      if(name in playground.contexts) {
        // fill the context with the example
        data.contexts = JSON.stringify(playground.contexts[name]);
      }
      else if('@context' in playground.examples[name]) {
        // use context from markup as default
        var ctx = { '@context': playground.examples[name]['@context'] };
        data.context = JSON.stringify(ctx);
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
    jsonld.documentLoader = function(url, callback) {
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
        url = modified;
      }
      jqueryDocumentLoader(url, callback);
    };

    // set up buttons to load examples
    $('.button').each(function(idx) {
      var button = $(this);
      button.click(function() {
        playground.populateWithExample(button.find('span').text());
      });
    });

    // set up 'process' areas to process JSON-LD after typing
    var processTimer = null;
    $('.process').keyup(function() {
      clearTimeout(processTimer);
      processTimer = setTimeout(playground.process, 500);
    });
  });

})(jQuery);
