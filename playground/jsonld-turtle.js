/**
 * Javascript implementation of TURTLE output for JSON-LD.
 *
 * @author Manu Sporny
 *
 * Copyright (c) 2011 Digital Bazaar, Inc. All rights reserved.
 */
(function()
{
var jsonld = forge.jsonld;

function getProperties(obj)
{
   var rval = [];

   for(var key in obj)
   {
      if(key != "@")
      {
         rval.push(key);
      }
   }

   return rval;
};

function isBnode(iri)
{
   var bnodePrefix = "_:";
   return (iri.substring(0, bnodePrefix.length) === bnodePrefix);
};

function iriToTurtle(iri)
{
   var rval = undefined;

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

function printObject(obj)
{
   var rval = undefined;

   // FIXME: Implement printing out arrays of objects

   if(typeof(obj) == "object")
   {
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
      rval = "\"" + obj + "\"";
   }

   return rval;
};

jsonld.turtle = function(input)
{
   var normalized = jsonld.normalize(input);
   var rval = "";

   for(s in normalized)
   {
      var subject = normalized[s];
      var iri = subject["@"]["@iri"];

      rval += iriToTurtle(iri) + "\n";

      // get all properties and perform a count on them
      var properties = getProperties(subject);
      var numProperties = properties.length;

      // iterate through all properties and serialize them
      var count = numProperties;
      for(p in properties)
      {
         property = properties[p];
         rval += "   <" + property + "> " + printObject(subject[property]);

         if(count == 1)
         {
            rval += ".\n";
         }
         else
         {
            rval += ";\n";
         }
         count -= 1;
      }
   }

   return rval;
};

})();

