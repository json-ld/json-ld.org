/**
 * The JSON-LD playground is used to test out JavaScript Object Notation 
 * for Linked Data.
 */
(function($)
{
   window.playground = window.playground || {};
   var playground = window.playground;

   playground.htmlEscape = function (s) 
   {
      return s.replace(/([&<>])/g, function (c) {
         return "&" + {
             "&": "amp",
             "<": "lt",
             ">": "gt"
         }[c] + ";";
      });
   }

   playground.init = function()
   {
      $("#tabs").tabs();
      $("#frame").hide();
      $("#tabs").bind("tabsselect", playground.tabSelected);
   };

   playground.tabSelected = function(event, ui)
   {
      if(ui.tab.id == "tab-framed")
      {
         $("#markup").addClass("compressed");
         $("#frame").show();
      }
      else
      {
         $("#frame").hide();
         $("#markup").removeClass("compressed");
      }
   };

   playground.process = function()
   {
      var input = null;
      var frame = null;

      try
      {
         var input = JSON.parse($("#markup").val());
      }
      catch(e)
      {
         console.log(e);
         $("#markup-errors").html(e);
      }


      try
      {
         var frame = JSON.parse($("#frame").val());
      }
      catch(e)
      {
         console.log(e);
         $("#frame-errors").html(e);
      }

      var normalized = forge.jsonld.normalize(input);
      var expanded = forge.jsonld.removeContext(input);
      var compacted = forge.jsonld.changeContext(
         input["@context"] || {}, input);
      var framed = forge.jsonld.frame(input, frame);
      var turtle = forge.jsonld.turtle(input);

      $("#normalized").html(js_beautify(JSON.stringify(normalized)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#compacted").html(js_beautify(JSON.stringify(compacted)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#expanded").html(js_beautify(JSON.stringify(expanded)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#framed").html(js_beautify(JSON.stringify(framed)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#turtle").html(playground.htmlEscape(turtle));

      prettyPrint();
   }
   
   playground.populate = function(type)
   {
      if(type in playground.examples)
      {
         $("#markup").val(js_beautify(JSON.stringify(playground.examples[type]),
            { "indent_size": 3, "brace_style": "expand" }));
         $("#frame").val("{}");

         if(type in playground.frames)
         {
            $("#frame").val(js_beautify(
               JSON.stringify(playground.frames[type]),
               { "indent_size": 3, "brace_style": "expand" }));
         }
      }

      playground.process();
   };

})(jQuery);

