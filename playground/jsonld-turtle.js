/**
 * Javascript implementation of TURTLE output for JSON-LD Forge project.
 *
 * @author Manu Sporny
 *
 * Copyright (c) 2011 Digital Bazaar, Inc. All rights reserved.
 */
(function()
{

/**
 * Retrieves all of the properties that are a part of a JSON-LD object, 
 * ignoring the "@" special character.
 *
 * @param obj the JSON-LD object - the last part of the triple.
 *
 * @return an array of cleaned keys for the JSON-LD object.
 */
function getProperties(obj)
{
   var rval = [];

   // accumulate the names of all non-JSON-LD special keys
   for(var key in obj)
   {
      if(key != "@subject")
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
      if("@literal" in obj && "@datatype" in obj)
      {
         rval = "\"" + obj["@literal"] + "\"^^<" + obj["@datatype"] + ">";
      }
      else if("@literal" in obj && "@language" in obj)
      {
         rval = "\"" + obj["@literal"] + "\"@" + obj["@language"];
      }
      else if("@iri" in obj)
      {
         var iri = obj["@iri"];
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
      var iri = subject["@subject"]["@iri"];

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
         rval += "   <" + property + "> " + objectToString(subject[property]);

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

