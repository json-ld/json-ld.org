/**
 * Javascript implementation of TURTLE output for JSON-LD Forge project.
 *
 * @author Manu Sporny
 *
 * Copyright (c) 2011-2012 Digital Bazaar, Inc. All rights reserved.
 */
(function()
{

/**
 * Retrieves all of the properties that are a part of a JSON-LD object, 
 * ignoring the "@id" key.
 *
 * @param obj the JSON-LD object - the last part of the triple.
 *
 * @return an array of cleaned keys for the JSON-LD object.
 */
function getProperties(obj)
{
   var rval = [];

   // accumulate the names of all non-JSON-LD subjects
   for(var key in obj)
   {
      if(key != "@id")
      {
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
function isBnode(iri)
{
   var bnodePrefix = "_:";
   
   return (iri.substring(0, bnodePrefix.length) === bnodePrefix);
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
function iriToTurtle(iri)
{
   var rval = undefined;

   // place angle brackets around anything that is not a Blank Node
   if(isBnode(iri))
   {
      rval = iri;
   }
   else
   {
      rval = "<" + iri + ">";
   }

   return rval;
};

/**
 * Converts the 'object' part of a 'subject', 'property', 'object' triple 
 * into a text string.
 *
 * @param obj the object to convert to a string.
 *
 * @return the string representation of the object.
 */
function objectToString(obj)
{
   var rval = undefined;

   if(obj instanceof Array)
   {
      // if the object is an array, convert each object in the list
      var firstItem = true;
      for(i in obj)
      {
         if(firstItem == true)
         {
            firstItem = false;
            rval = "\n      ";
         }
         else
         {
            rval += ",\n      ";
         }
         rval += objectToString(obj[i]);
      }
   }
   else if(obj instanceof Object)
   {
      // the object is an IRI, typed literal or language-tagged literal
      if("@value" in obj && "@type" in obj)
      {
         rval = "\"" + obj["@value"] + "\"^^<" + obj["@type"] + ">";
      }
      else if("@value" in obj && "@language" in obj)
      {
         rval = "\"" + obj["@value"] + "\"@" + obj["@language"];
      }
      else if("@id" in obj)
      {
         var iri = obj["@id"];
         rval = iriToTurtle(iri);
      }
   }
   else
   {
      // the object is a plain literal
      rval = "\"" + obj + "\"";
   }

   return rval;
};

/**
 * Converts JSON-LD input to a TURTLE formatted string.
 *
 * @param input the JSON-LD object as a JavaScript object.
 *
 * @return a TURTLE formatted string.
 */
jsonld.turtle = function(input)
{
   var normalized = jsonld.normalize(input);
   var rval = "";

   for(s in normalized)
   {
      // print out each key in the normalized array (the subjects)
      var subject = normalized[s];
      var iri = subject["@id"];
      
      // skip subjects with no properties (no triples to generate)
      if(Object.keys(subject).length === 1)
      {
         continue;
      }

      rval += iriToTurtle(iri) + "\n";

      // get all properties and perform a count on them
      var properties = getProperties(subject);
      var numProperties = properties.length;

      // iterate through all properties and serialize them
      var count = numProperties;
      for(p in properties)
      {
         // serialize each property-object combination
         property = properties[p];
         if(property == "@type")
         {
            rval += "   <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ";
         }
         else
         {
            rval += "   <" + property + "> ";
         }
         rval += objectToString(subject[property]);

         if(count == 1)
         {
            // if the item is the last item for this subject, end it with a '.'
            rval += ".\n";
         }
         else
         {
            // if the item is the last item for this subject, end it with a ';'
            rval += ";\n";
         }
         count -= 1;
      }
   }

   return rval;
};

})();

