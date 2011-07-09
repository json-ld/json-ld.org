/**
 * The JSON-LD playground is used to test out JavaScript Object Notation 
 * for Linked Data.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 */
(function($)
{
   // create the playground instance if it doesn't already exist
   window.playground = window.playground || {};
   var playground = window.playground;
   
   // set the active tab to the compacted view
   playground.activeTab = "tab-compacted";
   
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
   playground.htmlEscape = function(text) 
   {
      // replace each special HTML character in the string
      return text.replace(/([&<>])/g, function (c) {
         return "&" + {
             "&": "amp",
             "<": "lt",
             ">": "gt"
         }[c] + ";";
      });
   }

   /**
    * Used to initialize the UI, call once a document load.
    */
   playground.init = function()
   {
      $("#tabs").tabs();
      $("#frame").hide();
      $("#tabs").bind("tabsselect", playground.tabSelected);
   };

   /**
    * Callback for when tabs are selected in the UI.
    *
    * @param event the event that fired when the tab was selected.
    * @param ui the ui tab object that was selected
    */
   playground.tabSelected = function(event, ui)
   {
      playground.activeTab = ui.tab.id;
      if(ui.tab.id == "tab-framed")
      {
         // if the 'frame' tab is selected, display the frame input textarea
         $("#markup").addClass("compressed");
         $("#frame").show();
      }
      else
      {
         // if the 'frame' tab is not selected, hide the frame input area
         $("#frame").hide();
         $("#markup").removeClass("compressed");
      }
      
      // perform processing on the data provided in the input boxes
      playground.process();
      
      // apply the syntax colorization
      prettyPrint();
   };

   /**
    * Process the JSON-LD markup that has been input and display the output
    * in the active tab.
    */
   playground.process = function()
   {
      var input = null;
      var frame = null;
      var errors = false;

      // check to see if the JSON-LD markup is valid JSON
      try
      {
         $("#markup-errors").text("");
         input = JSON.parse($("#markup").val());
      }
      catch(e)
      {
         $("#markup-errors").text("JSON markup - " + e);
         errors = true;
      }

      // check to see if the JSON-LD frame is valid JSON
      try
      {
         $("#frame-errors").text("");
         var frame = JSON.parse($("#frame").val());
      }
      catch(e)
      {
         $("#frame-errors").text("JSON-LD frame - " + e);
         errors = true;
      }

      // if there are no errors, perform the action and display the output
      if(!errors)
      {
         if(playground.activeTab == "tab-normalized")
         {
            var normalized = forge.jsonld.normalize(input);
            $("#normalized").html(js_beautify(JSON.stringify(normalized)),
               { "indent_size": 3, "brace_style": "expand" });
         }
         else if(playground.activeTab == "tab-expanded")
         {
            var expanded = forge.jsonld.expand(input);
            $("#expanded").html(js_beautify(JSON.stringify(expanded)),
               { "indent_size": 3, "brace_style": "expand" });
         }
         else if(playground.activeTab == "tab-compacted")
         {
            var compacted = forge.jsonld.compact(
               input["@context"] || {}, input);
            $("#compacted").html(js_beautify(JSON.stringify(compacted)),
               { "indent_size": 3, "brace_style": "expand" });
         }
         else if(playground.activeTab == "tab-framed")
         {
            var framed = forge.jsonld.frame(input, frame);
            $("#framed").html(js_beautify(JSON.stringify(framed)),
               { "indent_size": 3, "brace_style": "expand" });
         }
         else if(playground.activeTab == "tab-turtle")
         {
            var turtle = forge.jsonld.turtle(input);
            $("#turtle").html(playground.htmlEscape(turtle));
         }
      }
      
      // Start the colorization delay
      playground.checkColorizeDelay(true);
   }

   /**
    * Performs a check on the colorize delay. If the delay hits 0, the
    * markup is colorized.
    *
    * @param reset true if the colorization timeout should be reset
    */
   playground.checkColorizeDelay = function(reset)
   {
      // if the counter reset flag is set, reset the counter
      if(reset)
      {
         playground.colorizeDelay = 500;
      }
      else
      {
         playground.colorizeDelay -= 250;
      }
      
      if(playground.colorizeDelay <= 0)
      {
         // if the delay has expired, perform colorization
         prettyPrint();
      }
      else
      {
         // if the delay has not expired, continue counting down
         if(playground.colorizeTimeout)
         {
            clearTimeout(playground.colorizeTimeout);
         }
         playground.colorizeTimeout = 
            setTimeout(playground.checkColorizeDelay, 250);
      }
   };

   /**
    * Callback when an example button is clicked.
    *
    * @param name the name of the example to pre-populate the input boxes.
    */
   playground.populate = function(name)
   {
      if(name in playground.examples)
      {
         // fill the markup box with the example
         $("#markup").val(js_beautify(JSON.stringify(playground.examples[name]),
            { "indent_size": 3, "brace_style": "expand" }));
         $("#frame").val("{}");

         if(name in playground.frames)
         {
            // fill the frame input box with the example frame
            $("#frame").val(js_beautify(
               JSON.stringify(playground.frames[name]),
               { "indent_size": 3, "brace_style": "expand" }));
         }
      }

      // perform processing on the data provided in the input boxes
      playground.process();

      // apply the syntax colorization
      prettyPrint();
   };

})(jQuery);

