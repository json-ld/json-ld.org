/**
 * Javascript implementation of TURTLE output for JSON-LD.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 *
 * Copyright (c) 2011-2013 Digital Bazaar, Inc. All rights reserved.
 */
(function() {

/**
 * Retrieves all of the properties that are a part of a JSON-LD object,
 * ignoring the "@id" key.
 *
 * @param obj the JSON-LD object - the last part of the triple.
 *
 * @return an array of cleaned keys for the JSON-LD object.
 */
function getProperties(obj) {
  // accumulate the names of all non-JSON-LD subjects
  var rval = [];
  for(var key in obj) {
    if(key !== '@id') {
      rval.push(key);
    }
  }
  return rval;
};

/**
 * Checks to see if the passed in IRI is a Blank Node.
 *
 * @param iri the IRI to check.
 *
 * @return true if the iri is a Blank Node, false otherwise.
 */
function isBnode(iri) {
  return iri.indexOf('_:') === 0;
};

/**
 * Converts an IRI to TURTLE format. If it is a regular scheme-based IRI,
 * angle brackets are placed around the value, otherwise, if the value is
 * a Blank Node, the value is used as-is.
 *
 * @param iri the IRI to convert to TURTLE format.
 *
 * @return the TURTLE-formatted IRI.
 */
function iriToTurtle(iri) {
  // place angle brackets around anything that is not a Blank Node
  return isBnode(iri) ? iri : ('<' + iri + '>');
};

/**
 * Converts the 'object' part of a 'subject', 'property', 'object' triple
 * into a text string.
 *
 * @param obj the object to convert to a string.
 *
 * @return the string representation of the object.
 */
function objectToString(obj) {
  var rval = '';

  if(obj instanceof Array) {
    // if the object is an array, convert each object in the list
    var firstItem = true;
    for(i in obj) {
      if(firstItem) {
        firstItem = false;
        rval = '\n      ';
      }
      else {
        rval += ',\n      ';
      }
      rval += objectToString(obj[i]);
    }
  }
  else if(obj instanceof Object) {
    if('@value' in obj) {
      rval = '"' + obj['@value'] + '"';

      if('@type' in obj) {
        // object is a typed literal
        rval += '^^<' + obj['@type'] + '>';
      }
      else if('@language' in obj) {
        // object is a plain literal with a language
        rval += '@' + obj['@language'];
      }
    }
    else if('@id' in obj) {
      rval = iriToTurtle(obj['@id']);
    }
  }
  else {
    // the object is a plain literal
    rval = '"' + obj + '"';
  }

  return rval;
};

/**
 * Converts JSON-LD input to a TURTLE formatted string.
 *
 * @param input the JSON-LD object as a JavaScript object.
 * @param options the JSON-LD options.
 * @param callback(err, turtle) called once the operation completes.
 */
jsonld.turtle = function(input, options, callback) {
  jsonld.normalize(input, options, function(err, normalized) {
    var output = '';
    for(s in normalized) {
      // print out each key in the normalized array (the subjects)
      var subject = normalized[s];
      var iri = subject['@id'];

      // skip subjects with no properties (no triples to generate)
      if(Object.keys(subject).length === 1) {
        continue;
      }

      output += iriToTurtle(iri) + '\n';

      // get all properties and perform a count on them
      var properties = getProperties(subject);
      var numProperties = properties.length;

      // iterate through all properties and serialize them
      var count = numProperties;
      for(p in properties) {
        // serialize each property-object combination
        property = properties[p];
        if(property === '@type') {
          output += '   <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ';
        }
        else {
          output += '   <' + property + '> ';
        }
        output += objectToString(subject[property]);

        if(count === 1) {
          // if the item is the last item for this subject, end it with a '.'
          output += '.\n';
        }
        else {
          // if the item is the last item for this subject, end it with a ';'
          output += ';\n';
        }
        count -= 1;
      }
    }
    callback(null, output);
  });
};

})();
