/**
 * The JSON-LD Playground example files.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 */
(function($)
{
   window.playground = window.playground || {};
   var playground = window.playground;
   
   // setup the examples and frame examples
   playground.examples = {};
   playground.frames = {};

   // add the example of a Person
   playground.examples["Person"] =
   {
      "name": "Manu Sporny",
      "homepage": "http://manu.sporny.org/",
      "@context":
      {
         "name": "http://xmlns.com/foaf/0.1/name",
         "homepage": "http://xmlns.com/foaf/0.1/homepage",
         "xsd": "http://www.w3.org/2001/XMLSchema#",
         "@coerce":
         {
            "xsd:anyURI": ["homepage"]
         }
      }
   };

   // add the example of a Place
   playground.examples["Place"] =
   {
      "name": "The Empire State Building",
      "description": "The Empire State Building is a 102-story landmark in New York City.",
      "image": "http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg",
      "geo": 
      {
         "latitude": "40.75",
         "longitude": "73.98"
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
            "xsd:anyURI": ["image"],
            "xsd:float": ["latitude", "longitude"]
         }
      }
   };

   // add the example of a Event
   playground.examples["Event"] =
   {
      "ical:summary": "Lady Gaga Concert",
      "ical:location": "New Orleans Arena, New Orleans, Louisiana, USA",
      "ical:dtstart": "2011-04-09T20:00Z",
      "@context":
      {
         "ical": "http://www.w3.org/2002/12/cal/ical#",
         "xsd": "http://www.w3.org/2001/XMLSchema#",
         "@coerce":
         {
            "xsd:dateTime": ["ical:dtstart"]
         }
      }
   };

   // add the example of a Product
   playground.examples["Product"] =
   {
      "@subject": "http://example.org/cars/for-sale#tesla",
      "@type": "gr:Offering",
      "gr:name": "Used Tesla Roadster",
      "gr:description": "Need to sell fast and furiously",
      "gr:hasBusinessFunction": "gr:Sell",
      "gr:acceptedPaymentMethods": "gr:Cash",
      "gr:hasPriceSpecification": 
      {
         "gr:hasCurrencyValue": "85000",
         "gr:hasCurrency": "USD",
      },
      "gr:includes": 
      {
         "@type": ["gr:Individual", "pto:Vehicle"],
         "gr:name": "Tesla Roadster",
         "foaf:page": "http://www.teslamotors.com/roadster"
      },
      "@context":
      {
         "gr": "http://purl.org/goodrelations/v1#",
         "pto": "http://www.productontology.org/id/",
         "foaf": "http://xmlns.com/foaf/0.1/",
         "xsd": "http://www.w3.org/2001/XMLSchema#",
         "@coerce":
         {
            "xsd:anyURI": ["foaf:page"],
            "xsd:float": ["gr:hasCurrencyValue"]
         }
      }
   };

   // add the example of a Recipe
   playground.examples["Recipe"] =
   {
      "name": "Mojito",
      "ingredient": ["12 fresh mint leaves", "1/2 lime, juiced with pulp",
         "1 tablespoons white sugar", "1 cup ice cubes",
         "2 fluid ounces white rum", "1/2 cup club soda"],
      "yield": "1 cocktail",
      "instructions" :
      [
         {
            "step": 1,
            "description": "Crush lime juice, mint and sugar together in glass."
         },
         {
            "step": 2,
            "description": "Fill glass to top with ice cubes."
         },
         {
            "step": 3,
            "description": "Pour white rum over ice."
         },
         {
            "step": 4,
            "description": "Fill the rest of glass with club soda, stir."
         },
         {
            "step": 5,
            "description": "Garnish with a lime wedge."
         }
      ],
      "@context":
      {
         "name": "http://rdf.data-vocabulary.org/#name",
         "ingredient": "http://rdf.data-vocabulary.org/#ingredients",
         "yield": "http://rdf.data-vocabulary.org/#yield",
         "instructions": "http://rdf.data-vocabulary.org/#instructions",
         "step": "http://rdf.data-vocabulary.org/#step",
         "description": "http://rdf.data-vocabulary.org/#description",
         "xsd": "http://www.w3.org/2001/XMLSchema#",
         "@coerce":
         {
            "xsd:integer": ["step"]
         }
      }
   };

   // add the example of a Library
   playground.examples["Library"] =
   {
      "@subject": [
         {
            "@subject": "http://example.org/library",
            "@type": "ex:Library",
            "ex:contains": "http://example.org/library/the-republic"
         },
         {
            "@subject": "http://example.org/library/the-republic",
            "@type": "ex:Book",
            "dc:creator": "Plato",
            "dc:title": "The Republic",
            "ex:contains": "http://example.org/library/the-republic#introduction"
         },
         {
            "@subject": "http://example.org/library/the-republic#introduction",
            "@type": "ex:Chapter",
            "dc:description": "An introductory chapter on The Republic.",
            "dc:title": "The Introduction"
         }
      ],
      "@context": 
      {
         "@coerce": 
         {
            "xsd:anyURI": "ex:contains"
         },
         "dc": "http://purl.org/dc/elements/1.1/",
         "ex": "http://example.org/vocab#"
      }
   };

   // add the frame example of a Library
   playground.frames["Library"] =
   {
      "@context": 
      {
         "dc": "http://purl.org/dc/elements/1.1/",
         "ex": "http://example.org/vocab#"
      },
      "@type": "ex:Library",
      "ex:contains": 
      {
         "@type": "ex:Book",
         "ex:contains": 
         {
            "@type": "ex:Chapter"
         }
      }
   };

})(jQuery);

