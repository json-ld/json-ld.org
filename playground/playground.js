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
   * Checks 'json-ld' and 'param' parameters.  If they look like JSON then
   * interpret as JSON strings else interpret as URLs of remote resources.
   * Note: URLs must be CORS enabled to load due to browser same origin policy
   * issues.
   */
  playground.processQueryParameters = function() {
    // data from the query
    var queryData = {
       markup: null,
       param: null
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
        hasQueryData = true;
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
    var paramDeferred = handleParameter(
      getParameterByName('param'), 'param', 'param');

    // wait for ajax if needed
    // failures handled in AJAX calls
    $.when(jsonLdDeferred, paramDeferred)
      .done(function() {
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
    playground.processQueryParameters();
  };

  /**
   * Callback for when tabs are selected in the UI.
   *
   * @param event the event that fired when the tab was selected.
   * @param ui the ui tab object that was selected
   */
  playground.tabSelected = function(event, ui) {
    playground.activeTab = ui.tab.id;
    if(ui.tab.id === 'tab-compacted' || ui.tab.id === 'tab-framed') {
      // if the 'compact' or 'frame' tab is selected, display the param
      // input textarea
      $('#markup').addClass('compressed');
      $('#param').show();

      if(ui.tab.id === 'tab-compacted') {
        $('#param-type').html('JSON-LD Context');
      }
      else {
        $('#param-type').html('JSON-LD Frame');
      }
    }
    else {
      // else no param required, hide the param input area
      $('#param').hide();
      $('#markup').removeClass('compressed');
      $('#param-type').html('');
    }

    // perform processing on the data provided in the input boxes
    playground.process();

    // apply the syntax colorization
    prettyPrint();
  };

  /**
   * Performs the JSON-LD API action based on the active tab.
   *
   * @param input the JSON-LD object input or null no error.
   * @param param the JSON-LD param to use.
   * @param callback(err) called once the operation completes.
   */
  playground.performAction = function(input, param, callback) {
    if(playground.activeTab === 'tab-normalized') {
      jsonld.normalize(input, function(err, normalized) {
        if(err) {
          return callback(err);
        }
        $('#normalized').html(js_beautify(JSON.stringify(normalized)),
          {'indent_size': 2, 'brace_style': 'expand'});
        callback();
      });
    }
    else if(playground.activeTab === 'tab-expanded') {
      jsonld.expand(input, function(err, expanded) {
        if(err) {
          return callback(err);
        }
        $('#expanded').html(js_beautify(JSON.stringify(expanded)),
          {'indent_size': 2, 'brace_style': 'expand'});
        callback();
      });
    }
    else if(playground.activeTab === 'tab-compacted') {
      jsonld.compact(input, param, function(err, compacted) {
        if(err) {
          return callback(err);
        }
        $('#compacted').html(js_beautify(JSON.stringify(compacted)),
          {'indent_size': 2, 'brace_style': 'expand'});
        callback();
      });
    }
    else if(playground.activeTab === 'tab-framed') {
      jsonld.frame(input, param, function(err, framed) {
        if(err) {
          return callback(err);
        }
        $('#framed').html(js_beautify(JSON.stringify(framed)),
          {'indent_size': 2, 'brace_style': 'expand'});
        callback();
      });
    }
    else if(playground.activeTab === 'tab-turtle') {
      jsonld.turtle(input, function(err, turtle) {
        if(err) {
          return callback(err);
        }
        $('#turtle').html(playground.htmlEscape(turtle));
        callback();
      });
    }
  };

  /**
   * Process the JSON-LD markup that has been input and display the output
   * in the active tab.
   */
  playground.process = function() {
    $('#markup-errors').text('');
    $('#param-errors').text('');
    $('#processing-errors').text('');
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

    // check to see if the JSON-LD param is valid JSON
    try {
      var param = JSON.parse($('#param').val());
    }
    catch(e) {
      $('#param-errors').text('JSON-LD param - ' + e);
      errors = true;
    }

    // errors detected
    if(errors) {
      $('#permalink').hide();

      // start the colorization delay
      playground.checkColorizeDelay(true);
      return;
    }

    // no errors, perform the action and display the output
    playground.performAction(input, param, function(err) {
      if(err) {
        // FIXME: add better error handling output
        $('#processing-errors').text(JSON.stringify(err));
        return;
      }

      // generate a link for current data
      var link = '?json-ld=' + encodeURIComponent(JSON.stringify(input));
      if($('#param').val().length > 0) {
        link += '&param=' + encodeURIComponent(JSON.stringify(param));
      }
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
   * Populate the UI with markup and param JSON. The data parameter should
   * have a 'markup' field and optional 'param' field that contain a
   * serialized JSON string.
   *
   * @param data object with optional 'markup' and 'param' fields.
   */
  playground.populateWithJSON = function(data) {
    var hasData = false;

    if('markup' in data && data.markup !== null) {
      hasData = true;
      // fill the markup box with the example
      $('#markup').val(js_beautify(
        data.markup, {'indent_size': 2, 'brace_style': 'expand'}));
    }

    if('param' in data && data.param !== null) {
      hasData = true;
      // fill the param input box with the example param
      $('#param').val(js_beautify(
        data.param, {'indent_size': 2, 'brace_style': 'expand'}));
    }
    else {
      $('#param').val('{}');
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
      param: null
    };

    if(name in playground.examples) {
      // fill the markup with the example
      data.markup = JSON.stringify(playground.examples[name]);

      if(name in playground.params) {
        // fill the param with the example param
        data.param = JSON.stringify(playground.params[name]);
      }
      else if('@context' in playground.examples[name]) {
        // use context from markup as default
        var ctx = {
          '@context': playground.examples[name]['@context']
        };
        data.param = JSON.stringify(ctx);
      }
    }

    // populate with the example
    playground.populateWithJSON(data);
  };

  // event handlers
  $(document).ready(function() {
    // use jquery URL resolver
    jsonld.useUrlResolver('jquery', $);

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
