/**
 * The JSON-LD Playground example files.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 */
(function($) {
  window.playground = window.playground || {};
  var playground = window.playground;

  // setup the examples and params
  playground.examples = {};
  playground.frames = {};
  playground.contexts = {};

  // add the example of a Person
  playground.examples["Person"] = {
    "@context": "http://schema.org/",
    "@type": "Person",
    "name": "Jane Doe",
    "jobTitle": "Professor",
    "telephone": "(425) 123-4567",
    "url": "http://www.janedoe.com"
  };

  // add the example of a Place
  playground.examples["Place"] = {
    "@context": {
      "name": "http://schema.org/name",
      "description": "http://schema.org/description",
      "image": {
        "@id": "http://schema.org/image",
        "@type": "@id"
      },
      "geo": "http://schema.org/geo",
      "latitude": {
        "@id": "http://schema.org/latitude",
        "@type": "xsd:float"
      },
      "longitude": {
        "@id": "http://schema.org/longitude",
        "@type": "xsd:float"
      },
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "name": "The Empire State Building",
    "description": "The Empire State Building is a 102-story landmark in New York City.",
    "image": "http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg",
    "geo": {
       "latitude": "40.75",
       "longitude": "73.98"
    }
  };

  // add the example of a Event
  playground.examples["Event"] = {
    "@context": {
      "ical": "http://www.w3.org/2002/12/cal/ical#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ical:dtstart": {
        "@type": "xsd:dateTime"
      }
    },
    "ical:summary": "Lady Gaga Concert",
    "ical:location": "New Orleans Arena, New Orleans, Louisiana, USA",
    "ical:dtstart": "2011-04-09T20:00Z"
  };

  // add the example of a Product
  playground.examples["Product"] = {
    "@context": {
      "gr": "http://purl.org/goodrelations/v1#",
      "pto": "http://www.productontology.org/id/",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "foaf:page": {"@type": "@id"},
      "gr:acceptedPaymentMethods": {"@type": "@id"},
      "gr:hasBusinessFunction": {"@type": "@id"},
       "gr:hasCurrencyValue": {"@type": "xsd:float"}
    },
    "@id": "http://example.org/cars/for-sale#tesla",
    "@type": "gr:Offering",
    "gr:name": "Used Tesla Roadster",
    "gr:description": "Need to sell fast and furiously",
    "gr:hasBusinessFunction": "gr:Sell",
    "gr:acceptedPaymentMethods": "gr:Cash",
    "gr:hasPriceSpecification": {
      "gr:hasCurrencyValue": "85000",
      "gr:hasCurrency": "USD"
    },
    "gr:includes": {
      "@type": ["gr:Individual", "pto:Vehicle"],
      "gr:name": "Tesla Roadster",
      "foaf:page": "http://www.teslamotors.com/roadster"
    }
  };

  // add the example of a Recipe
  playground.examples["Recipe"] = {
    "@context": {
      "name": "http://rdf.data-vocabulary.org/#name",
      "ingredient": "http://rdf.data-vocabulary.org/#ingredients",
      "yield": "http://rdf.data-vocabulary.org/#yield",
      "instructions": "http://rdf.data-vocabulary.org/#instructions",
      "step": {
        "@id": "http://rdf.data-vocabulary.org/#step",
        "@type": "xsd:integer"
      },
      "description": "http://rdf.data-vocabulary.org/#description",
      "xsd": "http://www.w3.org/2001/XMLSchema#"
    },
    "name": "Mojito",
    "ingredient": ["12 fresh mint leaves", "1/2 lime, juiced with pulp",
      "1 tablespoons white sugar", "1 cup ice cubes",
      "2 fluid ounces white rum", "1/2 cup club soda"],
    "yield": "1 cocktail",
    "instructions" : [{
      "step": 1,
      "description": "Crush lime juice, mint and sugar together in glass."
    }, {
      "step": 2,
      "description": "Fill glass to top with ice cubes."
    }, {
      "step": 3,
      "description": "Pour white rum over ice."
    }, {
      "step": 4,
      "description": "Fill the rest of glass with club soda, stir."
    }, {
      "step": 5,
      "description": "Garnish with a lime wedge."
    }]
  };

  // add the example of a Library
  playground.examples["Library"] = {
    "@context": {
      "dc": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex:contains": {"@type": "@id"}
    },
    "@graph": [{
      "@id": "http://example.org/library",
      "@type": "ex:Library",
      "ex:contains": "http://example.org/library/the-republic"
    }, {
      "@id": "http://example.org/library/the-republic",
      "@type": "ex:Book",
      "dc:creator": "Plato",
      "dc:title": "The Republic",
      "ex:contains": "http://example.org/library/the-republic#introduction"
    }, {
      "@id": "http://example.org/library/the-republic#introduction",
      "@type": "ex:Chapter",
      "dc:description": "An introductory chapter on The Republic.",
      "dc:title": "The Introduction"
    }]
  };

  // add the frame example of a Library
  playground.frames["Library"] = {
    "@context": {
      "dc": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#"
    },
    "@type": "ex:Library",
    "ex:contains": {
      "@type": "ex:Book",
      "ex:contains": {"@type": "ex:Chapter"}
    }
  };

  // add an Activity Streams 2.0 Example
  // currently uses the temporary dev location for the context document.
  playground.examples["Activity"] = {
    "@context": "http://www.w3.org/ns/activitystreams",
    "@type": "Create",
    "actor": {
      "@type": "Person",
      "@id": "acct:sally@example.org",
      "displayName": "Sally"
    },
    "object": {
      "@type": "Note",
      "content": "This is a simple note"
    },
    "published": "2015-01-25T12:34:56Z"
  }

})(jQuery);
