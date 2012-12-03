// extend the bibliography entries
var localBibliography = {
    "JSON-LD": "<cite><a href=\"http://json-ld.org/spec/ED/json-ld-syntax/20120522/\">The JSON-LD Syntax</a></cite> Manu Sporny, Gregg Kellogg, Markus Lanthaler Editors. World Wide Web Consortium (work in progress). 22 May 2012. Editor's Draft. This edition of the JSON-LD Syntax specification is http://json-ld.org/spec/ED/json-ld-syntax/20120522/. The <a href=\"http://json-ld.org/spec/latest/json-ld-syntax/\">latest edition of the JSON-LD Syntax</a> is available at http://json-ld.org/spec/latest/json-ld-syntax/",
    "JSON-LD-API": "<cite><a href=\"http://json-ld.org/spec/ED/json-ld-api/20120524/\">The JSON-LD API 1.0</a></cite> Manu Sporny, Gregg Kellogg, Dave Longley, Markus Lanthaler, Editors. World Wide Web Consortium (work in progress). 24 May 2012. Editor's Draft. This edition of the JSON-LD Syntax specification is http://json-ld.org/spec/ED/json-ld-api/20120524/. The <a href=\"http://json-ld.org/spec/latest/json-ld-api/\">latest edition of the JSON-LD Syntax</a> is available at http://json-ld.org/spec/latest/json-ld-api/",
    "IEEE-754-1985": "IEEE. <cite>IEEE Standard for Binary Floating-Point Arithmetic.</cite> See <a href=\"http://standards.ieee.org/reading/ieee/std_public/description/busarch/754-1985_desc.html\">http://standards.ieee.org/reading/ieee/std_public/description/busarch/754-1985_desc.html</a>",
    "RFC5988": "<cite><a href=\"http://tools.ietf.org/rfc/rfc5988\">Web Linking</a></cite> M. Nottingham. Editor. October 2010. IETF Standard. URL: <a href=\"http://tools.ietf.org/rfc/rfc5988.txt\">http://tools.ietf.org/rfc/rfc5988.txt</a>",
    "RDF-CONCEPTS": "<cite><a href=\"http://www.w3.org/TR/2011/WD-rdf11-concepts-20110830/\">RDF 1.1 Concepts and Abstract Syntax</a></cite> Richard Cyganiak, David Wood, Editors. World Wide Web Consortium (work in progress). 30 May 2012. Editor's Draft. This edition of the JSON-LD Syntax specification is http://www.w3.org/TR/2011/WD-rdf11-concepts-20110830/. The <a href=\"http://www.w3.org/TR/rdf11-concepts/\">latest edition of the JSON-LD Syntax</a> is available at http://www.w3.org/TR/rdf11-concepts/",
    "TURTLE-TR": "Eric Prud'hommeaux, Gavin Carothers. <cite><a href=\"http://www.w3.org/TR/2011/WD-turtle-20110809/\">Turtle: Terse RDF Triple Language.</a></cite> 09 August 2011. W3C Working Draft. URL: <a href=\"http://www.w3.org/TR/2011/WD-turtle-20110809/\">http://www.w3.org/TR/2011/WD-turtle-20110809/</a>",
    "MICRODATA": "<cite><a href=\"http://www.w3.org/TR/2012/WD-microdata-20120329/\">HTML Microdata</a></cite> Ian Hickson Editor. World Wide Web Consortium (work in progress). 29 March 2012. This edition of the HTML Microdata specification is http://www.w3.org/TR/2012/WD-microdata-20120329/. The <a href=\"http://www.w3.org/TR/microdata/\">latest edition of HTML Microdata</a> is available at http://www.w3.org/TR/microdata/",
    "WEBIDL": "<cite><a href=\"http://www.w3.org/TR/2012/CR-WebIDL-20120419/\">Web IDL</a></cite> Cameron McCormack, Editor. World Wide Web Consortium. 19 April 2012. Candidate Recommendataion. This edition of Web IDL is http://www.w3.org/TR/2012/CR-WebIDL-20120419/. The <a href=\"http://dev.w3.org/2006/webapi/WebIDL/\">latest edition of Web IDL</a> is available at http://dev.w3.org/2006/webapi/WebIDL/",
    "JSON-POINTER": "<cite><a href=\"http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-02\">JSON Pointer</a></cite> P. Bryan, Ed. IETF Draft. URL: <a href=\"http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-02\">http://tools.ietf.org/html/draft-ietf-appsawg-json-pointer-02</a>",
    "RDF-NORMALIZATION": "<cite><a href=\"http://json-ld.org/spec/ED/rdf-graph-normalization/20111016/\">RDF Graph Normalization</a></cite> Manu Sporny, Dave Longley Editors. World Wide Web Consortium (work in progress). 16 October 2011. Editor's Draft. This edition of the RDF Graph Normalization specification is http://json-ld.org/spec/ED/rdf-graph-normalization/20111016/. The <a href=\"http://json-ld.org/spec/latest/rdf-graph-normalization/\">latest edition of RDF Graph Normalization</a> is available at http://json-ld.org/spec/latest/rdf-graph-normalization/",
    "JSON-LD-TESTS": "<cite><a href=\"http://dvcs.w3.org/hg/json-ld/raw-file/default/test-suite/\">JSON-LD Test Suite</a></cite> (work in progress)."
};

var preProc = {
    apply:  function(c) {
        // process the document before anything else is done
        var refs = document.querySelectorAll('adef') ;
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var sp = document.createElement( 'dfn' ) ;
            var tit = item.getAttribute('title') ;
            if (!tit) {
                tit = con;
            }
            sp.className = 'adef' ;
            sp.title=tit ;
            sp.innerHTML = con ;
            p.replaceChild(sp, item) ;
        }
        refs = document.querySelectorAll('aref') ;
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var sp = document.createElement( 'a' ) ;
            sp.className = 'aref' ;
            sp.setAttribute('title', con);
            sp.innerHTML = '@'+con ;
            p.replaceChild(sp, item) ;
        }
        // local datatype references
        refs = document.querySelectorAll('ldtref') ;
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            if (!item) continue ;
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var ref = item.getAttribute('title') ;
            if (!ref) {
                ref = item.textContent ;
            }
            if (ref) {
                ref = ref.replace(/\s+/g, '_') ;
            }
            var sp = document.createElement( 'a' ) ;
            sp.className = 'datatype idlType';
            sp.title = ref ;
            sp.setAttribute('href', '#idl-def-' + ref);
            sp.innerHTML = '<code>' + con + '</code>';
            p.replaceChild(sp, item) ;
        }
        // external datatype references
        refs = document.querySelectorAll('dtref') ;
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            if (!item) continue ;
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var ref = item.getAttribute('title') ;
            if (!ref) {
                ref = item.textContent ;
            }
            if (ref) {
                ref = ref.replace(/\s+/g, '_') ;
            }
            var sp = document.createElement( 'a' ) ;
            sp.className = 'externalDFN';
            sp.title = ref ;
            sp.innerHTML = con ;
            p.replaceChild(sp, item) ;
        }
        // now do terms
        refs = document.querySelectorAll('tdef') ;
        var tdefs = [];
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            if (!item) continue ;
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var ref = item.getAttribute('title') ;
            if (!ref) {
                ref = item.textContent ;
            }
            if (ref) {
                ref = ref.replace(/\s+/g, '_').toLowerCase() ;
            }

            if ( tdefs[ref]) {
              throw "Duplicate definition of term '" + ref + "'" ;
            }

            var sp = document.createElement( 'dfn' ) ;
            tdefs[ref] = sp ;
            sp.title = ref ;
            sp.innerHTML = con ;
            p.replaceChild(sp, item) ;
        }
        // now term references
        refs = document.querySelectorAll('tref') ;
        for (var i = 0; i < refs.length; i++) {
            var item = refs[i];
            if (!item) continue ;
            var p = item.parentNode ;
            var con = item.innerHTML ;
            var ref = item.getAttribute('title') ;
            if (!ref) {
                ref = item.textContent ;
            }
            if (ref) {
                ref = ref.replace(/\s+/g, '_').toLowerCase() ;
            }

            if ( !tdefs[ref]) {
              throw "Reference to undefined term '" + ref + "'" ;
            }
            var sp = document.createElement( 'a' ) ;
            var id = item.textContent ;
            sp.className = 'tref' ;
            sp.title = ref ;
            sp.innerHTML = con ;
            p.replaceChild(sp, item) ;
        }
    }
};

function _esc(s) {
    s = s.replace(/&/g,'&amp;');
    s = s.replace(/>/g,'&gt;');
    s = s.replace(/"/g,'&quot;');
    s = s.replace(/</g,'&lt;');
    return s;
}

function updateExample(doc, content) {
  // perform transformations to make it render and prettier
  content = content.replace(/<!--/, '');
  content = content.replace(/-->/, '');
  content = _esc(content);
  content = content.replace(/\*\*\*\*([^*]*)\*\*\*\*/g, '<span class="diff">$1</span>') ;
  return content ;
}
