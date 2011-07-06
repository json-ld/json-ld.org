/**
 * The JSON-LD Sandbox is used to test out JavaScript 
 */
(function($)
{
   window.sandbox = window.sandbox || {};
   var sandbox = window.sandbox;

   var examples = {};

   sandbox.init = function()
   {
      $('#tabs').tabs();
      
      // Add the example of a Person
      examples["Person"] =
      {
         "@context":
         {
            "name": "http://xmlns.com/0.1/foaf/name",
            "homepage": "http://xmlns.com/0.1/foaf/homepage",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["homepage"]
            }
         },
         "name": "Manu Sporny",
         "homepage": "http://manu.sporny.org/"
      };
   };
   
   sandbox.process = function()
   {
      var input = JSON.parse($("#markup").val());
      var normalized = forge.jsonld.normalize(input);
      var expanded = forge.jsonld.removeContext(input);
      var compacted = forge.jsonld.changeContext(input["@context"] || {}, input);
     
      $("#normalized").html(js_beautify(JSON.stringify(normalized)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#compacted").html(js_beautify(JSON.stringify(compacted)),
         { "indent_size": 3, "brace_style": "expand" });
      $("#expanded").html(js_beautify(JSON.stringify(expanded)),
         { "indent_size": 3, "brace_style": "expand" });
   }
   
   sandbox.populate = function(type)
   {
      if(type in examples)
      {
         $("#markup").val(js_beautify(JSON.stringify(examples[type]),
            { "indent_size": 3, "brace_style": "expand" }));
      }

      sandbox.process();
   };

})(jQuery);

