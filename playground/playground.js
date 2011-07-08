/**
 * The JSON-LD playground is used to test out JavaScript Object Notation 
 * for Linked Data.
 */
(function($)
{
   window.playground = window.playground || {};
   var playground = window.playground;

   playground.init = function()
   {
      $("#tabs").tabs();
   };

   playground.process = function()
   {
      try
      {
         var input = JSON.parse($("#markup").val());
         var normalized = forge.jsonld.normalize(input);
         var expanded = forge.jsonld.removeContext(input);
         var compacted = forge.jsonld.changeContext(
            input["@context"] || {}, input);
         var framed = forge.jsonld.frame({}, input);

         $("#normalized").html(js_beautify(JSON.stringify(normalized)),
            { "indent_size": 3, "brace_style": "expand" });
         $("#compacted").html(js_beautify(JSON.stringify(compacted)),
            { "indent_size": 3, "brace_style": "expand" });
         $("#expanded").html(js_beautify(JSON.stringify(expanded)),
            { "indent_size": 3, "brace_style": "expand" });

         prettyPrint();
      }
      catch(e)
      {
         console.log(e);
         $("#errors").html(e);
      }
   }
   
   playground.populate = function(type)
   {
      if(type in playground.examples)
      {
         $("#markup").val(js_beautify(JSON.stringify(playground.examples[type]),
            { "indent_size": 3, "brace_style": "expand" }));
      }

      playground.process();
   };

})(jQuery);

