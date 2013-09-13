/** @preserve green-turtle version 1.2.0 Copyright (c) 2011-2013, R. Alexander Milowski <alex@milowski.com> All rights reserved. */
/**         

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function URIResolver() {
}
URIResolver.SCHEME = /^[A-Za-z][A-Za-z0-9\+\-\.]*\:/;

URIResolver.prototype.parseURI = function(uri) {
   var match = URIResolver.SCHEME.exec(uri);
   if (!match) {
      throw "Bad URI value, no scheme: "+uri;
   }
   var parsed = { spec: uri };
   parsed.scheme = match[0].substring(0,match[0].length-1);
   parsed.schemeSpecificPart = parsed.spec.substring(match[0].length);
   if (parsed.schemeSpecificPart.charAt(0)=='/' && parsed.schemeSpecificPart.charAt(1)=='/') {
      this.parseGeneric(parsed);
   } else {
      parsed.isGeneric = false;
   }
   parsed.normalize = function() {
      if (!this.isGeneric) {
         return;
      }
      if (this.segments.length==0) {
         return;
      }
      // edge case of ending in "/."
      if (this.path.length>1 && this.path.substring(this.path.length-2)=="/.") {
         this.path = this.path.substring(0,this.path.length-1);
         this.segments.splice(this.segments.length-1,1);
         this.schemeSpecificPart = "//"+this.authority+this.path;
         if (typeof this.query != "undefined") {
            this.schemeSpecificPart += "?" + this.query;
         }
         if (typeof this.fragment != "undefined") {
            this.schemeSpecificPart += "#" + this.fragment;
         }
         this.spec = this.scheme+":"+this.schemeSpecificPart;
         return;
      }
      var end = this.path.charAt(this.path.length-1);
      if (end!="/") {
         end = "";
      }
      for (var i=0; i<this.segments.length; i++) {
         if (i>0 && this.segments[i]=="..") {
            this.segments.splice(i-1,2);
            i -= 2;
         }
         if (this.segments[i]==".") {
            this.segments.splice(i,1);
            i--;
         }
      }
      this.path = this.segments.length==0 ? "/" : "/"+this.segments.join("/")+end;
      this.schemeSpecificPart = "//"+this.authority+this.path;
      if (typeof this.query != "undefined") {
         this.schemeSpecificPart += "?" + this.query;
      }
      if (typeof this.fragment != "undefined") {
         this.schemeSpecificPart += "#" + this.fragment;
      }
      this.spec = this.scheme+":"+this.schemeSpecificPart;
   }
   parsed.resolve = function(href) {
      if (!href) {
         return this.spec;
      }
      if (href.charAt(0)=='#') {
         var lastHash = this.spec.lastIndexOf('#');
         return lastHash<0 ? this.spec+href : this.spec.substring(0,lastHash)+href;
      }
      if (!this.isGeneric) {
         throw "Cannot resolve uri against non-generic URI: "+this.spec;
      }
      var colon = href.indexOf(':');
      if (href.charAt(0)=='/') {
         return this.scheme+"://"+this.authority+href;
      } else if (href.charAt(0)=='.' && href.charAt(1)=='/') {
         if (this.path.charAt(this.path.length-1)=='/') {
            return this.scheme+"://"+this.authority+this.path+href.substring(2);
         } else {
            var last = this.path.lastIndexOf('/');
            return this.scheme+"://"+this.authority+this.path.substring(0,last)+href.substring(1);
         }
      } else if (URIResolver.SCHEME.test(href)) {
         return href;
      } else if (href.charAt(0)=="?") {
         return this.scheme+"://"+this.authority+this.path+href;
      } else {
         if (this.path.charAt(this.path.length-1)=='/') {
            return this.scheme+"://"+this.authority+this.path+href;
         } else {
            var last = this.path.lastIndexOf('/');
            return this.scheme+"://"+this.authority+this.path.substring(0,last+1)+href;
         }
      }
   };
   parsed.relativeTo = function(otherURI) {
      if (otherURI.scheme!=this.scheme) {
         return this.spec;
      }
      if (!this.isGeneric) {
         throw "A non generic URI cannot be made relative: "+this.spec;
      }
      if (!otherURI.isGeneric) {
         throw "Cannot make a relative URI against a non-generic URI: "+otherURI.spec;
      }
      if (otherURI.authority!=this.authority) {
         return this.spec;
      }
      var i=0;
      for (; i<this.segments.length && i<otherURI.segments.length; i++) {
         if (this.segments[i]!=otherURI.segments[i]) {
            //alert(this.path+" different from "+otherURI.path+" at '"+this.segments[i]+"' vs '"+otherURI.segments[i]+"'");
            var relative = "";
            for (var j=i; j<otherURI.segments.length; j++) {
               relative += "../";
            }
            for (var j=i; j<this.segments.length; j++) {
               relative += this.segments[j];
               if ((j+1)<this.segments.length) {
                  relative += "/";
               }
            }
            if (this.path.charAt(this.path.length-1)=='/') {
               relative += "/";
            }
            return relative;
         }
      }
      if (this.segments.length==otherURI.segments.length) {
         return this.hash ? this.hash : (this.query ? this.query : "");
      } else if (i<this.segments.length) {
         var relative = "";
         for (var j=i; j<this.segments.length; j++) {
            relative += this.segments[j];
            if ((j+1)<this.segments.length) {
               relative += "/";
            }
         }
         if (this.path.charAt(this.path.length-1)=='/') {
            relative += "/";
         }
         return relative;
      } else {
         throw "Cannot calculate a relative URI for "+this.spec+" against "+otherURI.spec;
      } 
   };
   return parsed;
}

URIResolver.prototype.parseGeneric = function(parsed) {
   if (parsed.schemeSpecificPart.charAt(0)!='/' || parsed.schemeSpecificPart.charAt(1)!='/') {
      throw "Generic URI values should start with '//':"+parsed.spec;
   }
  
   var work = parsed.schemeSpecificPart.substring(2);
   var pathStart = work.indexOf("/");
   parsed.authority = pathStart<0 ? work : work.substring(0,pathStart);
   parsed.path = pathStart<0 ? "" : work.substring(pathStart);
   var hash = parsed.path.indexOf('#');
   if (hash>=0) {
      parsed.fragment = parsed.path.substring(hash+1);
      parsed.path = parsed.path.substring(0,hash);
   }
   var questionMark = parsed.path.indexOf('?');
   if (questionMark>=0) {
      parsed.query = parsed.path.substring(questionMark+1);
      parsed.path = parsed.path.substring(0,questionMark);
   }
   if (parsed.path=="/" || parsed.path=="") {
      parsed.segments = [];
   } else {
      parsed.segments = parsed.path.split(/\//);
      if (parsed.segments.length>0 && parsed.segments[0]=='' && parsed.path.length>1 && parsed.path.charAt(1)!='/') {
         // empty segment at the start, remove it
         parsed.segments.shift();
      }
      if (parsed.segments.length>0 && parsed.path.length>0 && parsed.path.charAt(parsed.path.length-1)=='/' && parsed.segments[parsed.segments.length-1]=='') {
         // we may have an empty the end
         // check to see if it is legimate
         if (parsed.path.length>1 && parsed.path.charAt(parsed.path.length-2)!='/') {
            parsed.segments.pop();
         }
      }
      // check for non-escaped characters
      for (var i=0; i<parsed.segments.length; i++) {
         var check = parsed.segments[i].split(/%[A-Za-z0-9][A-Za-z0-9]|[\ud800-\udfff][\ud800-\udfff]|[A-Za-z0-9\-\._~!$&'()*+,;=@:\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/);

                 for (var j=0; j<check.length; j++) {
            if (check[j].length>0) {
               throw "Unecaped character "+check[j].charAt(0)+" ("+check[j].charCodeAt(0)+") in URI "+parsed.spec;
            }
         }
      }
   }
   parsed.isGeneric = true;
}

RDFaProcessor.prototype = new URIResolver();
RDFaProcessor.prototype.constructor=RDFaProcessor;
function RDFaProcessor(targetObject) {
   if (targetObject) {
      this.target = targetObject;
   } else {
      this.target = {
         graph: {
            subjects: {},
            prefixes: {},
            terms: {}
         }
      };
   }
   this.theOne = "_:"+(new Date()).getTime();
   this.language = null;
   this.vocabulary = null;
   this.blankCounter = 0;
   this.langAttributes = [ { namespaceURI: "http://www.w3.org/XML/1998/namespace", localName: "lang" } ];
   this.inXHTMLMode = false;
   this.absURIRE = /[\w\_\-]+:\S+/;
   this.finishedHandlers = [];
   this.init();
}

RDFaProcessor.prototype.newBlankNode = function() {
   this.blankCounter++;
   return "_:"+this.blankCounter;
}

RDFaProcessor.XMLLiteralURI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"; 
RDFaProcessor.HTMLLiteralURI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML"; 
RDFaProcessor.PlainLiteralURI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral";
RDFaProcessor.objectURI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#object";
RDFaProcessor.typeURI = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

RDFaProcessor.nameChar = '[-A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u10000-\uEFFFF\.0-9\u00B7\u0300-\u036F\u203F-\u2040]';
RDFaProcessor.nameStartChar = '[\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u0131\u0134-\u013E\u0141-\u0148\u014A-\u017E\u0180-\u01C3\u01CD-\u01F0\u01F4-\u01F5\u01FA-\u0217\u0250-\u02A8\u02BB-\u02C1\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03D6\u03DA\u03DC\u03DE\u03E0\u03E2-\u03F3\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E-\u0481\u0490-\u04C4\u04C7-\u04C8\u04CB-\u04CC\u04D0-\u04EB\u04EE-\u04F5\u04F8-\u04F9\u0531-\u0556\u0559\u0561-\u0586\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0641-\u064A\u0671-\u06B7\u06BA-\u06BE\u06C0-\u06CE\u06D0-\u06D3\u06D5\u06E5-\u06E6\u0905-\u0939\u093D\u0958-\u0961\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8B\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AE0\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B36-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB5\u0BB7-\u0BB9\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CDE\u0CE0-\u0CE1\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D28\u0D2A-\u0D39\u0D60-\u0D61\u0E01-\u0E2E\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EAE\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0F40-\u0F47\u0F49-\u0F69\u10A0-\u10C5\u10D0-\u10F6\u1100\u1102-\u1103\u1105-\u1107\u1109\u110B-\u110C\u110E-\u1112\u113C\u113E\u1140\u114C\u114E\u1150\u1154-\u1155\u1159\u115F-\u1161\u1163\u1165\u1167\u1169\u116D-\u116E\u1172-\u1173\u1175\u119E\u11A8\u11AB\u11AE-\u11AF\u11B7-\u11B8\u11BA\u11BC-\u11C2\u11EB\u11F0\u11F9\u1E00-\u1E9B\u1EA0-\u1EF9\u1F00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2126\u212A-\u212B\u212E\u2180-\u2182\u3041-\u3094\u30A1-\u30FA\u3105-\u312C\uAC00-\uD7A3\u4E00-\u9FA5\u3007\u3021-\u3029_]';
RDFaProcessor.NCNAME = new RegExp('^' + RDFaProcessor.nameStartChar + RDFaProcessor.nameChar + '*$');

RDFaProcessor.trim = function(str) {
   return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

RDFaProcessor.prototype.tokenize = function(str) {
   return RDFaProcessor.trim(str).split(/\s+/);
}


RDFaProcessor.prototype.parseSafeCURIEOrCURIEOrURI = function(value,prefixes,base) {
   value = RDFaProcessor.trim(value);
   if (value.charAt(0)=='[' && value.charAt(value.length-1)==']') {
      value = value.substring(1,value.length-1);
      value = value.trim(value);
      if (value.length==0) {
         return null;
      }
      if (value=="_:") {
         // the one node
         return this.theOne;
      }
      return this.parseCURIE(value,prefixes,base);
   } else {
      return this.parseCURIEOrURI(value,prefixes,base);
   }
}

RDFaProcessor.prototype.parseCURIE = function(value,prefixes,base) {
   var colon = value.indexOf(":");
   if (colon>=0) {
      var prefix = value.substring(0,colon);
      if (prefix=="") {
         // default prefix
         var uri = prefixes[""];
         return uri ? uri+value.substring(colon+1) : null;
      } else if (prefix=="_") {
         // blank node
         return "_:"+value.substring(colon+1);
      } else if (RDFaProcessor.NCNAME.test(prefix)) {
         var uri = prefixes[prefix];
         if (uri) {
            return uri+value.substring(colon+1);
         }
      }
   }
   return null;
}

RDFaProcessor.prototype.parseCURIEOrURI = function(value,prefixes,base) {
   var curie = this.parseCURIE(value,prefixes,base);
   if (curie) {
      return curie;
   }
   return this.resolveAndNormalize(base,value);
}

RDFaProcessor.prototype.parsePredicate = function(value,defaultVocabulary,terms,prefixes,base,ignoreTerms) {
   if (value=="") {
      return null;
   }
   var predicate = this.parseTermOrCURIEOrAbsURI(value,defaultVocabulary,ignoreTerms ? null : terms,prefixes,base);
   if (predicate && predicate.indexOf("_:")==0) {
      return null;
   }
   return predicate;
}

RDFaProcessor.prototype.parseTermOrCURIEOrURI = function(value,defaultVocabulary,terms,prefixes,base) {
   //alert("Parsing "+value+" with default vocab "+defaultVocabulary);
   value = RDFaProcessor.trim(value);
   var curie = this.parseCURIE(value,prefixes,base);
   if (curie) {
      return curie;
   } else {
       var term = terms[value];
       if (term) {
          return term;
       }
       var lcvalue = value.toLowerCase();
       term = terms[lcvalue];
       if (term) {
          return term;
       }
       if (defaultVocabulary && !this.absURIRE.exec(value)) {
          return defaultVocabulary+value
       }
   }
   return this.resolveAndNormalize(base,value);
}

RDFaProcessor.prototype.parseTermOrCURIEOrAbsURI = function(value,defaultVocabulary,terms,prefixes,base) {
   //alert("Parsing "+value+" with default vocab "+defaultVocabulary);
   value = RDFaProcessor.trim(value);
   var curie = this.parseCURIE(value,prefixes,base);
   if (curie) {
      return curie;
   } else if (terms) {
       if (defaultVocabulary && !this.absURIRE.exec(value)) {
          return defaultVocabulary+value
       }
       var term = terms[value];
       if (term) {
          return term;
       }
       var lcvalue = value.toLowerCase();
       term = terms[lcvalue];
       if (term) {
          return term;
       }
   }
   if (this.absURIRE.exec(value)) {
      return this.resolveAndNormalize(base,value);
   }
   return null;
}

RDFaProcessor.prototype.resolveAndNormalize = function(base,href) {
   var u = base.resolve(href);
   var parsed = this.parseURI(u);
   parsed.normalize();
   return parsed.spec;
}

RDFaProcessor.prototype.parsePrefixMappings = function(str,target) {
   var values = this.tokenize(str);
   var prefix = null;
   var uri = null;
   for (var i=0; i<values.length; i++) {
      if (values[i][values[i].length-1]==':') {
         prefix = values[i].substring(0,values[i].length-1);
      } else if (prefix) {
         target[prefix] = this.target.baseURI ? this.target.baseURI.resolve(values[i]) : values[i];
         prefix = null;
      }
   }
}

RDFaProcessor.prototype.copyMappings = function(mappings) {
   var newMappings = {};
   for (var k in mappings) {
      newMappings[k] = mappings[k];
   }
   return newMappings;
}

RDFaProcessor.prototype.ancestorPath = function(node) {
   var path = "";
   while (node && node.nodeType!=Node.DOCUMENT_NODE) {
      path = "/"+node.localName+path;
      node = node.parentNode;
   }
   return path;
}

RDFaProcessor.prototype.setContext = function(node) {

   // We only recognized XHTML+RDFa 1.1 if the version is set propertyly
   if (node.localName=="html" && node.getAttribute("version")=="XHTML+RDFa 1.1") {
      this.setXHTMLContext();
   } else if (node.localName=="html" || node.namespaceURI=="http://www.w3.org/1999/xhtml") {
      if (document.doctype) {
         if (document.doctype.publicId=="-//W3C//DTD XHTML+RDFa 1.0//EN" && document.doctype.systemId=="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-1.dtd") {
            console.log("WARNING: RDF 1.0 is not supported.  Defaulting to HTML5 mode.");
            this.setHTMLContext();
         } else if (document.doctype.publicId=="-//W3C//DTD XHTML+RDFa 1.1//EN" && document.doctype.systemId=="http://www.w3.org/MarkUp/DTD/xhtml-rdfa-2.dtd") {
            this.setXHTMLContext();
         } else {
            this.setHTMLContext();
         }
      } else {
         this.setHTMLContext();
      }
   } else {
      this.setXMLContext();
   }

}

RDFaProcessor.prototype.setInitialContext = function() {
   this.vocabulary = null;
   this.target.graph.prefixes = {};
   this.target.graph.terms = {};
   this.langAttributes = [ { namespaceURI: "http://www.w3.org/XML/1998/namespace", localName: "lang" } ];
   
   this.target.graph.prefixes[""] = "http://www.w3.org/1999/xhtml/vocab#";

   // w3c
   this.target.graph.prefixes["grddl"] = "http://www.w3.org/2003/g/data-view#";
   this.target.graph.prefixes["ma"] = "http://www.w3.org/ns/ma-ont#";
   this.target.graph.prefixes["owl"] = "http://www.w3.org/2002/07/owl#";
   this.target.graph.prefixes["rdf"] = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
   this.target.graph.prefixes["rdfa"] = "http://www.w3.org/ns/rdfa#";
   this.target.graph.prefixes["rdfs"] = "http://www.w3.org/2000/01/rdf-schema#";
   this.target.graph.prefixes["rif"] = "http://www.w3.org/2007/rif#";
   this.target.graph.prefixes["skos"] = "http://www.w3.org/2004/02/skos/core#";
   this.target.graph.prefixes["skosxl"] = "http://www.w3.org/2008/05/skos-xl#";
   this.target.graph.prefixes["wdr"] = "http://www.w3.org/2007/05/powder#";
   this.target.graph.prefixes["void"] = "http://rdfs.org/ns/void#";
   this.target.graph.prefixes["wdrs"] = "http://www.w3.org/2007/05/powder-s#";
   this.target.graph.prefixes["xhv"] = "http://www.w3.org/1999/xhtml/vocab#";
   this.target.graph.prefixes["xml"] = "http://www.w3.org/XML/1998/namespace";
   this.target.graph.prefixes["xsd"] = "http://www.w3.org/2001/XMLSchema#";
   // non-rec w3c
   this.target.graph.prefixes["sd"] = "http://www.w3.org/ns/sparql-service-description#";
   this.target.graph.prefixes["org"] = "http://www.w3.org/ns/org#";
   this.target.graph.prefixes["gldp"] = "http://www.w3.org/ns/people#";
   this.target.graph.prefixes["cnt"] = "http://www.w3.org/2008/content#";
   this.target.graph.prefixes["dcat"] = "http://www.w3.org/ns/dcat#";
   this.target.graph.prefixes["earl"] = "http://www.w3.org/ns/earl#";
   this.target.graph.prefixes["ht"] = "http://www.w3.org/2006/http#";
   this.target.graph.prefixes["ptr"] = "http://www.w3.org/2009/pointers#";
   // widely used
   this.target.graph.prefixes["cc"] = "http://creativecommons.org/ns#";
   this.target.graph.prefixes["ctag"] = "http://commontag.org/ns#";
   this.target.graph.prefixes["dc"] = "http://purl.org/dc/terms/";
   this.target.graph.prefixes["dcterms"] = "http://purl.org/dc/terms/";
   this.target.graph.prefixes["foaf"] = "http://xmlns.com/foaf/0.1/";
   this.target.graph.prefixes["gr"] = "http://purl.org/goodrelations/v1#";
   this.target.graph.prefixes["ical"] = "http://www.w3.org/2002/12/cal/icaltzd#";
   this.target.graph.prefixes["og"] = "http://ogp.me/ns#";
   this.target.graph.prefixes["rev"] = "http://purl.org/stuff/rev#";
   this.target.graph.prefixes["sioc"] = "http://rdfs.org/sioc/ns#";
   this.target.graph.prefixes["v"] = "http://rdf.data-vocabulary.org/#";
   this.target.graph.prefixes["vcard"] = "http://www.w3.org/2006/vcard/ns#";
   this.target.graph.prefixes["schema"] = "http://schema.org/";
   
   // terms
   this.target.graph.terms["describedby"] = "http://www.w3.org/2007/05/powder-s#describedby";
   this.target.graph.terms["license"] = "http://www.w3.org/1999/xhtml/vocab#license";
   this.target.graph.terms["role"] = "http://www.w3.org/1999/xhtml/vocab#role";
}

RDFaProcessor.prototype.setXMLContext = function() {
   this.setInitialContext();
   this.inXHTMLMode = false;
   this.inHTMLMode = false;
}

RDFaProcessor.prototype.setHTMLContext = function() {
   this.setInitialContext();
   this.langAttributes = [ { namespaceURI: "http://www.w3.org/XML/1998/namespace", localName: "lang" },
                           { namespaceURI: null, localName: "lang" }];
   this.inXHTMLMode = false;
   this.inHTMLMode = true;
}

RDFaProcessor.prototype.setXHTMLContext = function() {

   this.setInitialContext();
   
   this.inXHTMLMode = true;
   this.inHTMLMode = false;
   
   this.langAttributes = [ { namespaceURI: "http://www.w3.org/XML/1998/namespace", localName: "lang" },
                           { namespaceURI: null, localName: "lang" }];

   // From http://www.w3.org/2011/rdfa-context/xhtml-rdfa-1.1
   this.target.graph.terms["alternate"] = "http://www.w3.org/1999/xhtml/vocab#alternate";
   this.target.graph.terms["appendix"] = "http://www.w3.org/1999/xhtml/vocab#appendix";
   this.target.graph.terms["bookmark"] = "http://www.w3.org/1999/xhtml/vocab#bookmark";
   this.target.graph.terms["cite"] = "http://www.w3.org/1999/xhtml/vocab#cite"
   this.target.graph.terms["chapter"] = "http://www.w3.org/1999/xhtml/vocab#chapter";
   this.target.graph.terms["contents"] = "http://www.w3.org/1999/xhtml/vocab#contents";
   this.target.graph.terms["copyright"] = "http://www.w3.org/1999/xhtml/vocab#copyright";
   this.target.graph.terms["first"] = "http://www.w3.org/1999/xhtml/vocab#first";
   this.target.graph.terms["glossary"] = "http://www.w3.org/1999/xhtml/vocab#glossary";
   this.target.graph.terms["help"] = "http://www.w3.org/1999/xhtml/vocab#help";
   this.target.graph.terms["icon"] = "http://www.w3.org/1999/xhtml/vocab#icon";
   this.target.graph.terms["index"] = "http://www.w3.org/1999/xhtml/vocab#index";
   this.target.graph.terms["last"] = "http://www.w3.org/1999/xhtml/vocab#last";
   this.target.graph.terms["license"] = "http://www.w3.org/1999/xhtml/vocab#license";
   this.target.graph.terms["meta"] = "http://www.w3.org/1999/xhtml/vocab#meta";
   this.target.graph.terms["next"] = "http://www.w3.org/1999/xhtml/vocab#next";
   this.target.graph.terms["prev"] = "http://www.w3.org/1999/xhtml/vocab#prev";
   this.target.graph.terms["previous"] = "http://www.w3.org/1999/xhtml/vocab#previous";
   this.target.graph.terms["section"] = "http://www.w3.org/1999/xhtml/vocab#section";
   this.target.graph.terms["stylesheet"] = "http://www.w3.org/1999/xhtml/vocab#stylesheet";
   this.target.graph.terms["subsection"] = "http://www.w3.org/1999/xhtml/vocab#subsection";
   this.target.graph.terms["start"] = "http://www.w3.org/1999/xhtml/vocab#start";
   this.target.graph.terms["top"] = "http://www.w3.org/1999/xhtml/vocab#top";
   this.target.graph.terms["up"] = "http://www.w3.org/1999/xhtml/vocab#up";
   this.target.graph.terms["p3pv1"] = "http://www.w3.org/1999/xhtml/vocab#p3pv1";

   // other
   this.target.graph.terms["related"] = "http://www.w3.org/1999/xhtml/vocab#related";
   this.target.graph.terms["role"] = "http://www.w3.org/1999/xhtml/vocab#role";
   this.target.graph.terms["transformation"] = "http://www.w3.org/1999/xhtml/vocab#transformation";
}

RDFaProcessor.prototype.init = function() {
}

RDFaProcessor.prototype.newSubjectOrigin = function(origin,subject) {
}

RDFaProcessor.prototype.addTriple = function(origin,subject,predicate,object) {
}

RDFaProcessor.dateTimeTypes = [
   { pattern: /-?P(?:[0-9]+Y)?(?:[0-9]+M)?(?:[0-9]+D)?(?:T(?:[0-9]+H)?(?:[0-9]+M)?(?:[0-9]+(?:\.[0-9]+)?S)?)?/,
     type: "http://www.w3.org/2001/XMLSchema#duration" },
   { pattern: /-?(?:[1-9][0-9][0-9][0-9]|0[1-9][0-9][0-9]|00[1-9][0-9]|000[1-9])-[0-9][0-9]-[0-9][0-9]T(?:[0-1][0-9]|2[0-4]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?(?:Z|[+\-][0-9][0-9]:[0-9][0-9])?/,
     type: "http://www.w3.org/2001/XMLSchema#dateTime" },
   { pattern: /-?(?:[1-9][0-9][0-9][0-9]|0[1-9][0-9][0-9]|00[1-9][0-9]|000[1-9])-[0-9][0-9]-[0-9][0-9](?:Z|[+\-][0-9][0-9]:[0-9][0-9])?/,
     type: "http://www.w3.org/2001/XMLSchema#date" },
   { pattern: /(?:[0-1][0-9]|2[0-4]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?(?:Z|[+\-][0-9][0-9]:[0-9][0-9])?/,
     type: "http://www.w3.org/2001/XMLSchema#time" },
   { pattern: /-?(?:[1-9][0-9][0-9][0-9]|0[1-9][0-9][0-9]|00[1-9][0-9]|000[1-9])-[0-9][0-9]/,
     type: "http://www.w3.org/2001/XMLSchema#gYearMonth" },
   { pattern: /-?[1-9][0-9][0-9][0-9]|0[1-9][0-9][0-9]|00[1-9][0-9]|000[1-9]/,
     type: "http://www.w3.org/2001/XMLSchema#gYear" }
];

RDFaProcessor.deriveDateTimeType = function(value) {
   for (var i=0; i<RDFaProcessor.dateTimeTypes.length; i++) {
      //console.log("Checking "+value+" against "+RDFaProcessor.dateTimeTypes[i].type);
      var matched = RDFaProcessor.dateTimeTypes[i].pattern.exec(value);
      if (matched && matched[0].length==value.length) {
         //console.log("Matched!");
         return RDFaProcessor.dateTimeTypes[i].type;
      }
   }
   return null;
}

RDFaProcessor.prototype.process = function(node,options) {

   /*
   if (!window.console) {
      window.console = { log: function() {} };
   }*/
   if (node.nodeType==Node.DOCUMENT_NODE) {
      node = node.documentElement;
      this.setContext(node);
   } else if (node.parentNode.nodeType==Node.DOCUMENT_NODE) {
      this.setContext(node);
   } 
   var queue = [];
   // Fix for Firefox that includes the hash in the base URI
   var removeHash = function(baseURI) {
      var hash = baseURI.indexOf("#");
      if (hash>=0) {
         baseURI = baseURI.substring(0,hash);
      }
      if (options && options.baseURIMap) {
         baseURI = options.baseURIMap(baseURI);
      }
      return baseURI;
   }
   queue.push({ current: node, context: this.push(null,removeHash(node.baseURI))});
   while (queue.length>0) {
      var item = queue.shift();
      if (item.parent) {
         // Sequence Step 14: list triple generation
         if (item.context.parent && item.context.parent.listMapping==item.listMapping) {
            // Skip a child context with exactly the same mapping
            continue;
         }
         //console.log("Generating lists for "+item.subject+", tag "+item.parent.localName);
         for (var predicate in item.listMapping) {
            var list = item.listMapping[predicate];
            if (list.length==0) {
               this.addTriple(item.parent,item.subject,predicate,{ type: RDFaProcessor.objectURI, value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" });
               continue;
            }
            var bnodes = [];
            for (var i=0; i<list.length; i++) {
               bnodes.push(this.newBlankNode());
               //this.newSubject(item.parent,bnodes[i]);
            }
            for (var i=0; i<bnodes.length; i++) {
               this.addTriple(item.parent,bnodes[i],"http://www.w3.org/1999/02/22-rdf-syntax-ns#first",list[i]);
               this.addTriple(item.parent,bnodes[i],"http://www.w3.org/1999/02/22-rdf-syntax-ns#rest",{ type: RDFaProcessor.objectURI , value: (i+1)<bnodes.length ? bnodes[i+1] : "http://www.w3.org/1999/02/22-rdf-syntax-ns#nil" });
            }
            this.addTriple(item.parent,item.subject,predicate,{ type: RDFaProcessor.objectURI, value: bnodes[0] });
         }
         continue;
      }
      var current = item.current;
      var context = item.context;

      //console.log("Tag: "+current.localName+", listMapping="+JSON.stringify(context.listMapping));

      // Sequence Step 1
      var skip = false;
      var newSubject = null;
      var currentObjectResource = null;
      var typedResource = null;
      var prefixes = context.prefixes;
      var prefixesCopied = false;
      var incomplete = [];
      var listMapping = context.listMapping;
      var listMappingDifferent = context.parent ? false : true;
      var language = context.language;
      var vocabulary = context.vocabulary;

      // TODO: the "base" element may be used for HTML+RDFa 1.1
      var base = this.parseURI(removeHash(current.baseURI));
      current.item = null;

      // Sequence Step 2: set the default vocabulary
      var vocabAtt = current.getAttributeNode("vocab");
      if (vocabAtt) {
         var value = RDFaProcessor.trim(vocabAtt.value);
         if (value.length>0) {
            vocabulary = value;
            var baseSubject = base.spec;
            //this.newSubject(current,baseSubject);
            this.addTriple(current,baseSubject,"http://www.w3.org/ns/rdfa#usesVocabulary",{ type: RDFaProcessor.objectURI , value: vocabulary});
         } else {
            vocabulary = this.vocabulary;
         }
      }

      // Sequence Step 3: IRI mappings
      // handle xmlns attributes
      for (var i=0; i<current.attributes.length; i++) {
         var att = current.attributes[i];
         //if (att.namespaceURI=="http://www.w3.org/2000/xmlns/") {
         if (att.nodeName.charAt(0)=="x" && att.nodeName.indexOf("xmlns:")==0) {
            if (!prefixesCopied) {
               prefixes = this.copyMappings(prefixes);
               prefixesCopied = true;
            }
            var prefix = att.nodeName.substring(6);
            // TODO: resolve relative?
            var ref = RDFaProcessor.trim(att.value);
            prefixes[prefix] = this.target.baseURI ? this.target.baseURI.resolve(ref) : ref;
         }
      }
      // Handle prefix mappings (@prefix)
      var prefixAtt = current.getAttributeNode("prefix");
      if (prefixAtt) {
         if (!prefixesCopied) {
            prefixes = this.copyMappings(prefixes);
            prefixesCopied = true;
         }
         this.parsePrefixMappings(prefixAtt.value,prefixes);
      }


      // Sequence Step 4: language
      var xmlLangAtt = null;
      for (var i=0; !xmlLangAtt && i<this.langAttributes.length; i++) {
         xmlLangAtt = current.getAttributeNodeNS(this.langAttributes[i].namespaceURI,this.langAttributes[i].localName);
      }
      if (xmlLangAtt) {
         var value = RDFaProcessor.trim(xmlLangAtt.value);
         if (value.length>0) {
            language = value;
         } else {
            language = null;
         }
      }

      var relAtt = current.getAttributeNode("rel");
      var revAtt = current.getAttributeNode("rev");
      var typeofAtt = current.getAttributeNode("typeof");
      var propertyAtt = current.getAttributeNode("property");
      var datatypeAtt = current.getAttributeNode("datatype");
      var datetimeAtt = this.inHTMLMode ? current.getAttributeNode("datetime") : null;
      var contentAtt = current.getAttributeNode("content");
      var aboutAtt = current.getAttributeNode("about");
      var srcAtt = current.getAttributeNode("src");
      var resourceAtt = current.getAttributeNode("resource");
      var hrefAtt = current.getAttributeNode("href");
      var inlistAtt = current.getAttributeNode("inlist");
      
      var relAttPredicates = [];
      if (relAtt) {
         var values = this.tokenize(relAtt.value);
         for (var i=0; i<values.length; i++) {
            var predicate = this.parsePredicate(values[i],vocabulary,context.terms,prefixes,base,this.inHTMLMode && propertyAtt!=null);
            if (predicate) {
               relAttPredicates.push(predicate);
            }
         }
      }
      var revAttPredicates = [];
      if (revAtt) {
         var values = this.tokenize(revAtt.value);
         for (var i=0; i<values.length; i++) {
            var predicate = this.parsePredicate(values[i],vocabulary,context.terms,prefixes,base,this.inHTMLMode && propertyAtt!=null);
            if (predicate) {
               revAttPredicates.push(predicate);
            }
         }
      }
      
      // Section 3.1, bullet 7
      if (this.inHTMLMode && (relAtt!=null || revAtt!=null) && propertyAtt!=null) {
         if (relAttPredicates.length==0) {
            relAtt = null;
         }
         if (revAttPredicates.length==0) {
            revAtt = null;
         }
      }

      if (relAtt || revAtt) {
         // Sequence Step 6: establish new subject and value
         if (aboutAtt) {
            newSubject = this.parseSafeCURIEOrCURIEOrURI(aboutAtt.value,prefixes,base);
         }
         if (typeofAtt) {
            typedResource = newSubject;
         }
         if (!newSubject) {
            if (current.parentNode.nodeType==Node.DOCUMENT_NODE) {
               newSubject = removeHash(current.baseURI);
            } else if (context.parentObject) {
               // TODO: Verify: If the xml:base has been set and the parentObject is the baseURI of the parent, then the subject needs to be the new base URI
               newSubject = removeHash(current.parentNode.baseURI)==context.parentObject ? removeHash(current.baseURI) : context.parentObject;
            }
         }
         if (resourceAtt) {
            currentObjectResource = this.parseSafeCURIEOrCURIEOrURI(resourceAtt.value,prefixes,base);
         }
         
         if (!currentObjectResource) {
            if (hrefAtt) {
               currentObjectResource = this.resolveAndNormalize(base,encodeURI(hrefAtt.value));
            } else if (srcAtt) {
               currentObjectResource = this.resolveAndNormalize(base,encodeURI(srcAtt.value));
            } else if (typeofAtt && !aboutAtt && !(this.inXHTMLMode && (current.localName=="head" || current.localName=="body"))) {
               currentObjectResource = this.newBlankNode();
            }
         }
         if (typeofAtt && !aboutAtt && this.inXHTMLMode && (current.localName=="head" || current.localName=="body")) {
            typedResource = newSubject;
         } else if (typeofAtt && !aboutAtt) {
            typedResource = currentObjectResource;
         }

      } else if (propertyAtt && !contentAtt && !datatypeAtt) {
         // Sequence Step 5.1: establish a new subject
         if (aboutAtt) {
            newSubject = this.parseSafeCURIEOrCURIEOrURI(aboutAtt.value,prefixes,base);
            if (typeofAtt) {
               typedResource = newSubject;
            }
         }
         if (!newSubject && current.parentNode.nodeType==Node.DOCUMENT_NODE) {
            newSubject = removeHash(current.baseURI);
            if (typeofAtt) {
               typedResource = newSubject;
            }
         } else if (!newSubject && context.parentObject) {
            // TODO: Verify: If the xml:base has been set and the parentObject is the baseURI of the parent, then the subject needs to be the new base URI
            newSubject = removeHash(current.parentNode.baseURI)==context.parentObject ? removeHash(current.baseURI) : context.parentObject;
         }
         if (typeofAtt && !typedResource) {
            if (resourceAtt) {
               typedResource = this.parseSafeCURIEOrCURIEOrURI(resourceAtt.value,prefixes,base);
            }
            if (!typedResource &&hrefAtt) {
               typedResource = this.resolveAndNormalize(base,encodeURI(hrefAtt.value));
            }
            if (!typedResource && srcAtt) {
               typedResource = this.resolveAndNormalize(base,encodeURI(srcAtt.value));
            }
            if (!typedResource && (this.inXHTMLMode || this.inHTMLMode) && (current.localName=="head" || current.localName=="body")) {
               typedResource = newSubject;
            }
            if (!typedResource) {
               typedResource = this.newBlankNode();
            }
            currentObjectResource = typedResource;
         }
         //console.log(current.localName+", newSubject="+newSubject+", typedResource="+typedResource+", currentObjectResource="+currentObjectResource);
      } else {
         // Sequence Step 5.2: establish a new subject
         if (aboutAtt) {
            newSubject = this.parseSafeCURIEOrCURIEOrURI(aboutAtt.value,prefixes,base);
         }
         if (!newSubject && resourceAtt) {
            newSubject = this.parseSafeCURIEOrCURIEOrURI(resourceAtt.value,prefixes,base);
         }
         if (!newSubject && hrefAtt) {
            newSubject = this.resolveAndNormalize(base,encodeURI(hrefAtt.value));
         }
         if (!newSubject && srcAtt) {
            newSubject = this.resolveAndNormalize(base,encodeURI(srcAtt.value));
         }
         if (!newSubject) {
            if (current.parentNode.nodeType==Node.DOCUMENT_NODE) {
               newSubject = removeHash(current.baseURI);
            } else if ((this.inXHTMLMode || this.inHTMLMode) && (current.localName=="head" || current.localName=="body")) {
               newSubject = removeHash(current.parentNode.baseURI)==context.parentObject ? removeHash(current.baseURI) : context.parentObject;
            } else if (typeofAtt) {
               newSubject = this.newBlankNode();
            } else if (context.parentObject) {
               // TODO: Verify: If the xml:base has been set and the parentObject is the baseURI of the parent, then the subject needs to be the new base URI
               newSubject = removeHash(current.parentNode.baseURI)==context.parentObject ? removeHash(current.baseURI) : context.parentObject;
               if (!propertyAtt) {
                  skip = true;
               }
            }
         }
         if (typeofAtt) {
            typedResource = newSubject;
         }
      }

      //console.log(current.tagName+": newSubject="+newSubject+", currentObjectResource="+currentObjectResource+", typedResource="+typedResource+", skip="+skip);

      var rdfaData = null;
      if (newSubject) {
         //this.newSubject(current,newSubject);
         if (aboutAtt || resourceAtt || typedResource) {
            var id = newSubject;
            if (typeofAtt && !aboutAtt && !resourceAtt && currentObjectResource) {
               id = currentObjectResource;
            }
            //console.log("Setting data attribute for "+current.localName+" for subject "+id);
            this.newSubjectOrigin(current,id);
         }
      }
      
      // Sequence Step 7: generate type triple
      if (typedResource) {
         var values = this.tokenize(typeofAtt.value);
         for (var i=0; i<values.length; i++) {
            var object = this.parseTermOrCURIEOrAbsURI(values[i],vocabulary,context.terms,prefixes,base);
            if (object) {
               this.addTriple(current,typedResource,RDFaProcessor.typeURI,{ type: RDFaProcessor.objectURI , value: object});
            }
         }
      }

      // Sequence Step 8: new list mappings if there is a new subject
      //console.log("Step 8: newSubject="+newSubject+", context.parentObject="+context.parentObject);
      if (newSubject && newSubject!=context.parentObject) {
         //console.log("Generating new list mapping for "+newSubject);
         listMapping = {};
         listMappingDifferent = true;
      }

      // Sequence Step 9: generate object triple
      if (currentObjectResource) {
         if (relAtt && inlistAtt) {
            for (var i=0; i<relAttPredicates.length; i++) {
               var list = listMapping[relAttPredicates[i]];
               if (!list) {
                  list = [];
                  listMapping[relAttPredicates[i]] = list;
               }
               list.push({ type: RDFaProcessor.objectURI, value: currentObjectResource });
            }
         } else if (relAtt) {
            for (var i=0; i<relAttPredicates.length; i++) {
               this.addTriple(current,newSubject,relAttPredicates[i],{ type: RDFaProcessor.objectURI, value: currentObjectResource});
            }
         }
         if (revAtt) {
            for (var i=0; i<revAttPredicates.length; i++) {
               this.addTriple(current,currentObjectResource, revAttPredicates[i], { type: RDFaProcessor.objectURI, value: newSubject});
            }
         }
      } else {
         // Sequence Step 10: incomplete triples
         if (newSubject && !currentObjectResource && (relAtt || revAtt)) {
            currentObjectResource = this.newBlankNode();
            //alert(current.tagName+": generated blank node, newSubject="+newSubject+" currentObjectResource="+currentObjectResource);
         }
         if (relAtt && inlistAtt) {
            for (var i=0; i<relAttPredicates.length; i++) {
               var list = listMapping[relAttPredicates[i]];
               if (!list) {
                  list = [];
                  listMapping[predicate] = list;
               }
               //console.log("Adding incomplete list for "+predicate);
               incomplete.push({ predicate: relAttPredicates[i], list: list });
            }
         } else if (relAtt) {
            for (var i=0; i<relAttPredicates.length; i++) {
               incomplete.push({ predicate: relAttPredicates[i], forward: true });
            }
         }
         if (revAtt) {
            for (var i=0; i<revAttPredicates.length; i++) {
               incomplete.push({ predicate: revAttPredicates[i], forward: false });
            }
         }
      }

      // Step 11: Current property values
      if (propertyAtt) {
         var datatype = null;
         var content = null; 
         if (datatypeAtt) {
            datatype = datatypeAtt.value=="" ? RDFaProcessor.PlainLiteralURI : this.parseTermOrCURIEOrAbsURI(datatypeAtt.value,vocabulary,context.terms,prefixes,base);
            if (datetimeAtt && !contentAtt) {
               content = datetimeAtt.value;
            } else {
               content = datatype==RDFaProcessor.XMLLiteralURI || datatype==RDFaProcessor.HTMLLiteralURI ? null : (contentAtt ? contentAtt.value : current.textContent);
            }
         } else if (contentAtt) {
            datatype = RDFaProcessor.PlainLiteralURI;
            content = contentAtt.value;
         } else if (datetimeAtt) {
            content = datetimeAtt.value;
            datatype = RDFaProcessor.deriveDateTimeType(content);
            if (!datatype) {
               datatype = RDFaProcessor.PlainLiteralURI;
            }
         } else if (!relAtt && !revAtt) {
            if (resourceAtt) {
               content = this.parseSafeCURIEOrCURIEOrURI(resourceAtt.value,prefixes,base);
            }
            if (!content && hrefAtt) {
               content = this.resolveAndNormalize(base,encodeURI(hrefAtt.value));
            } else if (!content && srcAtt) {
               content = this.resolveAndNormalize(base,encodeURI(srcAtt.value));
            }
            if (content) {
               datatype = RDFaProcessor.objectURI;
            }
         }
         if (!datatype) {
            if (typeofAtt && !aboutAtt) {
               datatype = RDFaProcessor.objectURI;
               content = typedResource;
            } else {
               content = current.textContent;
               if (this.inHTMLMode && current.localName=="time") {
                  datatype = RDFaProcessor.deriveDateTimeType(content);
               }
               if (!datatype) {
                  datatype = RDFaProcessor.PlainLiteralURI;
               }
            }
         }
         var values = this.tokenize(propertyAtt.value);
         for (var i=0; i<values.length; i++) {
            var predicate = this.parsePredicate(values[i],vocabulary,context.terms,prefixes,base);
            if (predicate) {
               if (inlistAtt) {
                  var list = listMapping[predicate];
                  if (!list) {
                     list = [];
                     listMapping[predicate] = list;
                  }
                  list.push((datatype==RDFaProcessor.XMLLiteralURI || datatype==RDFaProcessor.HTMLLiteralURI) ? { type: datatype, value: current.childNodes} : { type: datatype ? datatype : RDFaProcessor.PlainLiteralURI, value: content, language: language});
               } else {
                  if (datatype==RDFaProcessor.XMLLiteralURI || datatype==RDFaProcessor.HTMLLiteralURI) {
                     this.addTriple(current,newSubject,predicate,{ type: datatype, value: current.childNodes});
                  } else {
                     this.addTriple(current,newSubject,predicate,{ type: datatype ? datatype : RDFaProcessor.PlainLiteralURI, value: content, language: language});
                     //console.log(newSubject+" "+predicate+"="+content);
                  }
               }
            }
         }
      }

      // Sequence Step 12: complete incomplete triples with new subject
      if (newSubject && !skip) {
         for (var i=0; i<context.incomplete.length; i++) {
            if (context.incomplete[i].list) {
               //console.log("Adding subject "+newSubject+" to list for "+context.incomplete[i].predicate);
               // TODO: it is unclear what to do here
               context.incomplete[i].list.push({ type: RDFaProcessor.objectURI, value: newSubject });
            } else if (context.incomplete[i].forward) {
               //console.log(current.tagName+": completing forward triple "+context.incomplete[i].predicate+" with object="+newSubject);
               this.addTriple(current,context.subject,context.incomplete[i].predicate, { type: RDFaProcessor.objectURI, value: newSubject});
            } else {
               //console.log(current.tagName+": completing reverse triple with object="+context.subject);
               this.addTriple(current,newSubject,context.incomplete[i].predicate,{ type: RDFaProcessor.objectURI, value: context.subject});
            }
         }
      }

      var childContext = null;
      var listSubject = newSubject;
      if (skip) {
         // TODO: should subject be null?
         childContext = this.push(context,context.subject);
         // TODO: should the entObject be passed along?  If not, then intermediary children will keep properties from being associated with incomplete triples.
         // TODO: Verify: if the current baseURI has changed and the parentObject is the parent's base URI, then the baseURI should change
         childContext.parentObject = removeHash(current.parentNode.baseURI)==context.parentObject ? removeHash(current.baseURI) : context.parentObject;
         childContext.incomplete = context.incomplete;
         childContext.language = language;
         childContext.prefixes = prefixes;
         childContext.vocabulary = vocabulary;
      } else {
         childContext = this.push(context,newSubject);
         childContext.parentObject = currentObjectResource ? currentObjectResource : (newSubject ? newSubject : context.subject);
         childContext.prefixes = prefixes;
         childContext.incomplete = incomplete;
         if (currentObjectResource) {
            //console.log("Generating new list mapping for "+currentObjectResource);
            listSubject = currentObjectResource;
            listMapping = {};
            listMappingDifferent = true;
         }
         childContext.listMapping = listMapping;
         childContext.language = language;
         childContext.vocabulary = vocabulary;
      }
      if (listMappingDifferent) {
         //console.log("Pushing list parent "+current.localName);
         queue.unshift({ parent: current, context: context, subject: listSubject, listMapping: listMapping});
      }
      for (var child = current.lastChild; child; child = child.previousSibling) {
         if (child.nodeType==Node.ELEMENT_NODE) {
            //console.log("Pushing child "+child.localName);
            queue.unshift({ current: child, context: childContext});
         }
      }
   }
   
   if (this.inHTMLMode) {
      this.copyProperties();
   }

   for (var i=0; i<this.finishedHandlers.length; i++) {
      this.finishedHandlers[i](node);
   }
}

RDFaProcessor.prototype.copyProperties = function() {
}


RDFaProcessor.prototype.push = function(parent,subject) {
   return {
      parent: parent,
      subject: subject ? subject : (parent ? parent.subject : null),
      parentObject: null,
      incomplete: [],
      listMapping: parent ? parent.listMapping : {},
      language: parent ? parent.language : this.language,
      prefixes: parent ? parent.prefixes : this.target.graph.prefixes,
      terms: parent ? parent.terms : this.target.graph.terms,
      vocabulary: parent ? parent.vocabulary : this.vocabulary
   };
};

function RDFaGraph()
{
   var dataContext = this;
   this.curieParser = {
      trim: function(str) {
         return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      },
      parse: function(value,resolve) {
         value = this.trim(value);
         if (value.charAt(0)=='[' && value.charAt(value.length-1)==']') {
            value = value.substring(1,value.length-1);
         }
         var colon = value.indexOf(":");
         if (colon>=0) {
            var prefix = value.substring(0,colon);
            if (prefix=="") {
               // default prefix
               var uri = dataContext.prefixes[""];
               return uri ? uri+value.substring(colon+1) : null;
            } else if (prefix=="_") {
               // blank node
               return "_:"+value.substring(colon+1);
            } else if (DocumentData.NCNAME.test(prefix)) {
               var uri = dataContext.prefixes[prefix];
               if (uri) {
                  return uri+value.substring(colon+1);
               }
            }
         }

         return resolve ? dataContext.baseURI.resolve(value) : value;
      }
   };
   this.base =  null;
   this.toString = function(requestOptions) {
      var options = requestOptions && requestOptions.shorten ? { graph: this, shorten: true, prefixesUsed: {} } : null;
      s = "";
      for (var subject in this.subjects) {
         var snode = this.subjects[subject];
         s += snode.toString(options);
         s += "\n";
      }
      var prolog = requestOptions && requestOptions.baseURI ? "@base <"+baseURI+"> .\n" : "";
      if (options && options.shorten) {
         for (var prefix in options.prefixesUsed) {
            prolog += "@prefix "+prefix+" <"+this.prefixes[prefix]+"> .\n";
         }
      }
      return prolog.length==0 ? s : prolog+"\n"+s;
   };
   this.clear = function() {
      this.subjects = {};
      this.prefixes = {};
      this.terms = {};
   }
   this.clear();
   Object.defineProperty(this,"tripleCount",{
      enumerable: true,
      configurable: false,
      get: function() {
         var count = 0;
         for (var s in this.subjects) {
            var snode = this.subjects[s];
            for (var p in snode.predicates) {
               count += snode.predicates[p].objects.length;
            }
         }
         return count;
      }
   });
}

RDFaGraph.prototype.expand = function(curie) {
   return this.curieParser.parse(curie,true);  
}

RDFaGraph.prototype.shorten = function(uri,prefixesUsed) {
   for (prefix in this.prefixes) {
      var mapped = this.prefixes[prefix];
      if (uri.indexOf(mapped)==0) {
         if (prefixesUsed) {
            prefixesUsed[prefix] = mapped;
         }
         return prefix+":"+uri.substring(mapped.length);
      }
   }
   return null;
}

function RDFaSubject(graph,subject) {
   this.graph = graph;
   // TODO: subject or id?
   this.subject = subject
   this.id = subject;
   this.predicates =  {};
   this.origins = [];
   this.types = [];
}

RDFaSubject.prototype.toString = function(options) {
   var s = null;
   if (this.subject.substring(0,2)=="_:") {
      s = this.subject;
   } else if (options && options.shorten) {
      s = this.graph.shorten(this.subject,options.prefixesUsed);
      if (!s) {
         s = "<" + this.subject + ">";
      }
   } else {
      s = "<" + this.subject + ">";
   }
   var first = true;
   for (var predicate in this.predicates) {
      if (!first) {
         s += ";\n";
      } else {
         first = false;
      }
      s += " " + this.predicates[predicate].toString(options);
   }
   s += " .";
   return s;
}

RDFaSubject.prototype.toObject = function() {
   var o = { subject: this.subject, predicates: {} };
   for (var predicate in this.predicates) {
      var pnode = this.predicates[predicate];
      var p = { predicate: predicate, objects: [] };
      o.predicates[predicate] = p;
      for (var i=0; i<pnode.objects.length; i++) {
         var object = pnode.objects[i];
         if (object.type==RDFaProcessor.XMLLiteralURI) {
            var serializer = new XMLSerializer();
            var value = "";
            for (var x=0; x<object.value.length; x++) {
               if (object.value[x].nodeType==Node.ELEMENT_NODE) {
                  value += serializer.serializeToString(object.value[x]);
               } else if (object.value[x].nodeType==Node.TEXT_NODE) {
                  value += object.value[x].nodeValue;
               }
            } 
            p.objects.push({ type: object.type, value: value, language: object.language });
         } else {
            p.objects.push({ type: object.type, value: object.value, language: object.language });
         }
      }
   }
   return o;
   
}

RDFaSubject.prototype.getValues = function() {
   var values = [];
   for (var i=0; i<arguments.length; i++) {
      var property = this.graph.curieParser.parse(arguments[i],true)
      var pnode = this.predicates[property];
      if (pnode) {
         for (var j=0; j<pnode.objects.length; j++) {
            values.push(pnode.objects[j].value);
         }
      }
   }
   return values;
}

function RDFaPredicate(predicate) {
   this.id = predicate;
   this.predicate = predicate;
   this.objects = [];
}

RDFaPredicate.getPrefixMap = function(e) {
   var prefixMap = {};
   while (e.attributes) {
      for (var i=0; i<e.attributes.length; i++) {
         if (e.attributes[i].namespaceURI=="http://www.w3.org/2000/xmlns/") {
            var prefix = e.attributes[i].localName;
            if (e.attributes[i].localName=="xmlns") {
               prefix = "";
            }
            if (!(prefix in prefixMap)) {
               prefixMap[prefix] = e.attributes[i].nodeValue;
            }
         }
      }
      e = e.parentNode;
   }
   return prefixMap;
}

RDFaPredicate.prototype.toString = function(options) {
   var s = null;
   if (options && options.shorten && options.graph) {
      s = options.graph.shorten(this.predicate,options.prefixesUsed);
      if (!s) {
         s = "<" + this.predicate + ">"
      }
   } else {
      s = "<" + this.predicate + ">"
   }
   s += " ";
   for (var i=0; i<this.objects.length; i++) {
      if (i>0) {
         s += ", ";
      }
      // TODO: handle HTML literal
      if (this.objects[i].type=="http://www.w3.org/1999/02/22-rdf-syntax-ns#object") {
         if (this.objects[i].value.substring(0,2)=="_:") {
            s += this.objects[i].value;
         } else if (options && options.shorten && options.graph) {
            s = options.graph.shorten(this.objects[i].value,options.prefixesUsed);
            if (!s) {
               s = "<" + this.objects[i].value + ">"
            }
         } else {
            s += "<" + this.objects[i].value + ">";
         }
      } else if (this.objects[i].type=="http://www.w3.org/2001/XMLSchema#integer" ||
                 this.objects[i].type=="http://www.w3.org/2001/XMLSchema#decimal" ||
                 this.objects[i].type=="http://www.w3.org/2001/XMLSchema#double" ||
                 this.objects[i].type=="http://www.w3.org/2001/XMLSchema#boolean") {
         s += this.objects[i].value;
      } else if (this.objects[i].type=="http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral") {
         var serializer = new XMLSerializer();
         var value = "";
         for (var x=0; x<this.objects[i].value.length; x++) {
            if (this.objects[i].value[x].nodeType==Node.ELEMENT_NODE) {
               var prefixMap = RDFaPredicate.getPrefixMap(this.objects[i].value[x]);
               var prefixes = [];
               for (var prefix in prefixMap) {
                  prefixes.push(prefix);
               }
               prefixes.sort();
               var e = this.objects[i].value[x].cloneNode(true);
               for (var p=0; p<prefixes.length; p++) {
                  e.setAttributeNS("http://www.w3.org/2000/xmlns/",prefixes[p].length==0 ? "xmlns" : "xmlns:"+prefixes[p],prefixMap[prefixes[p]]);
               }
               value += serializer.serializeToString(e);
            } else if (this.objects[i].value[x].nodeType==Node.TEXT_NODE) {
               value += this.objects[i].value[x].nodeValue;
            }
         }
         s += '"""'+value.replace(/"""/,"\\\"\\\"\\\"")+'"""^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral>';
      } else {
         var l = this.objects[i].value;
         if (l.indexOf("\n")>=0 || l.indexOf("\r")>=0) {
            s += '"""' + l.replace(/"""/,"\\\"\\\"\\\"") + '"""';
         } else {
            s += '"' + l.replace(/"/,"\\\"") + '"';
         }
         if (this.objects[i].type!="http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral") {
             s += "^^<"+this.objects[i].type+">";
         } else if (this.objects[i].language) {
             s += "@"+this.objects[i].language;
         }
      }
   }
   return s;
}
GraphRDFaProcessor.prototype = new RDFaProcessor();
GraphRDFaProcessor.prototype.constructor=RDFaProcessor;
function GraphRDFaProcessor(target) {
   RDFaProcessor.call(this,target);
}

GraphRDFaProcessor.prototype.getObjectSize = function(obj) {
   var size = 0;
   for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
         size++;
      }
   }
   return size;
};


GraphRDFaProcessor.prototype.init = function() {
   var thisObj = this;
   this.finishedHandlers.push(function(node) {
      for (var subject in thisObj.target.graph.subjects) {
         var snode = thisObj.target.graph.subjects[subject];
         if (thisObj.getObjectSize(snode.predicates)==0) {
            delete thisObj.target.graph.subjects[subject];
         }
      }
   });
}

GraphRDFaProcessor.prototype.newSubjectOrigin = function(origin,subject) {
   var snode = this.newSubject(null,subject);
   for (var i=0; i<snode.origins.length; i++) {
      if (snode.origins[i]===origin) {
         return;
      }
   }
   snode.origins.push(origin);
   if (!origin.data) {
      Object.defineProperty(origin,"data", {
            value: snode,
            writable: false,
            configurable: true,
            enumerable: true
         });
   }
}

GraphRDFaProcessor.prototype.newSubject = function(origin,subject) {
   var snode = this.target.graph.subjects[subject];
   if (!snode) {
      snode = new RDFaSubject(this.target.graph,subject);
      this.target.graph.subjects[subject] = snode;
   }
   return snode;
}


GraphRDFaProcessor.prototype.addTriple = function(origin,subject,predicate,object) {
   var snode = this.newSubject(origin,subject);
   var pnode = snode.predicates[predicate];
   if (!pnode) {
      pnode = new RDFaPredicate(predicate);
      snode.predicates[predicate] = pnode;
   }

   for (var i=0; i<pnode.objects.length; i++) {
      if (pnode.objects[i].type==object.type && pnode.objects[i].value==object.value) {
         if (pnode.objects[i].origin!==origin) {
            if (!Array.isArray(pnode.objects[i].origin)) {
               var origins = [];
               origins.push(pnode.objects[i].origin);
               pnode.objects[i].origin = origins;
            }
            pnode.objects[i].origin.push(origin);
         }
         return;
      }
   }
   pnode.objects.push(object);   
   object.origin = origin;
   if (predicate==RDFaProcessor.typeURI) {
      snode.types.push(object.value);
   }
}

GraphRDFaProcessor.rdfaCopyPredicate = "http://www.w3.org/ns/rdfa#copy";
GraphRDFaProcessor.rdfaPatternType = "http://www.w3.org/ns/rdfa#Pattern";

GraphRDFaProcessor.prototype.copyProperties = function() {
   var copySubjects = [];
   var patternSubjects = {};
   for (var subject in this.target.graph.subjects) {
      var snode = this.target.graph.subjects[subject];
      var pnode = snode.predicates[GraphRDFaProcessor.rdfaCopyPredicate];
      if (!pnode) {
         continue;
      }
      copySubjects.push(subject);
      for (var i=0; i<pnode.objects.length; i++) {
         if (pnode.objects[i].type!=RDFaProcessor.objectURI) {
            continue;
         }
         var target = pnode.objects[i].value;
         var patternSubjectNode = this.target.graph.subjects[target];
         if (!patternSubjectNode) {
            continue;
         }
         var patternTypes = patternSubjectNode.predicates[RDFaProcessor.typeURI];
         if (!patternTypes) {
            continue;
         }
         var isPattern = false;
         for (var j=0; j<patternTypes.objects.length && !isPattern; j++) {
            if (patternTypes.objects[j].value==GraphRDFaProcessor.rdfaPatternType && 
                patternTypes.objects[j].type==RDFaProcessor.objectURI) {
               isPattern = true;
            }
         }
         if (!isPattern) {
            continue;
         }
         patternSubjects[target] = true;
         for (var predicate in patternSubjectNode.predicates) {
            var targetPNode = patternSubjectNode.predicates[predicate];
            if (predicate==RDFaProcessor.typeURI) {
               if (targetPNode.objects.length==1) {
                  continue;
               }
               for (var j=0; j<targetPNode.objects.length; j++) {
                  if (targetPNode.objects[j].value!=GraphRDFaProcessor.rdfaPatternType) {
                      var subjectPNode = snode.predicates[predicate];
                      if (!subjectPNode) {
                         subjectPNode = new RDFaPredicate(predicate);
                         snode.predicates[predicate] = subjectPNode;
                      }
                      subjectPNode.objects.push(
                         { type: targetPNode.objects[j].type, 
                           value: targetPNode.objects[j].value, 
                           language: targetPNode.objects[j].language, 
                           origin: targetPNode.objects[j].origin}
                      );
                      snode.types.push(targetPNode.objects[j].value);
                  }
               }
            } else {
               var subjectPNode = snode.predicates[predicate];
               if (!subjectPNode) {
                  subjectPNode = new RDFaPredicate(predicate);
                  snode.predicates[predicate] = subjectPNode;
               }
               for (var j=0; j<targetPNode.objects.length; j++) {
                   subjectPNode.objects.push(
                      { type: targetPNode.objects[j].type, 
                        value: targetPNode.objects[j].value, 
                        language: targetPNode.objects[j].language, 
                        origin: targetPNode.objects[j].origin}
                   );
               }
            }
         }
      }
   }
   for (var i=0; i<copySubjects.length; i++) {
      var snode = this.target.graph.subjects[copySubjects[i]];
      delete snode.predicates[GraphRDFaProcessor.rdfaCopyPredicate];
   }
   for (var subject in patternSubjects) {
      delete this.target.graph.subjects[subject];
   }
}

