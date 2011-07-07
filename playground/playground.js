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
         "name": "Manu Sporny",
         "homepage": "http://manu.sporny.org/",
         "@context":
         {
            "name": "http://xmlns.com/0.1/foaf/name",
            "homepage": "http://xmlns.com/0.1/foaf/homepage",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["homepage"]
            }
         }
      };

      // Add the example of a Place
      examples["Place"] =
      {
         "name": "The Empire State Building",
         "description": "The Empire State Building is a 102-story landmark in New York City.",
         "image": "http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg",
         "geo": 
         {
            "latitude": 40.75,
            "longitude": 73.98
         },
         "@context":
         {
            "name": "http://schema.org/name",
            "description": "http://schema.org/description",
            "image": "http://schema.org/image",
            "geo": "http://schema.org/geo",
            "latitude": "http://schema.org/latitude",
            "longitude": "http://schema.org/longitude",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["image"]
            }
         }
      };

      // Add the example of a Event
      examples["Event"] =
      {
         "name": "Rock Show",
         "@context":
         {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["image"]
            }
         }
      };

      // Add the example of a Product
      examples["Product"] =
      {
         "name": "Tesla Roadster",
         "@context":
         {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["image"]
            }
         }
      };

      // Add the example of a Recipe
      examples["Recipe"] =
      {
         "name": "Mojito",
         "@context":
         {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["image"]
            }
         }
      };

      // Add the example of a Library
      examples["Library"] =
      {
         "name": "The Long Library",
         "@context":
         {
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "@coerce":
            {
               "xsd:anyURI": ["image"]
            }
         }
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

      prettyPrint();
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

