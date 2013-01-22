// extend the bibliography entries
var localBibliography = {
    "JSON-LD": "Manu Sporny, Gregg Kellogg, Markus Lanthaler, Editors. <cite><a href=\"http://json-ld.org/spec/latest/json-ld-syntax/\">JSON-LD 1.0</a>.</cite> W3C Editor's Draft (work in progress). URL: <a href=\"http://json-ld.org/spec/latest/json-ld-syntax/\">http://json-ld.org/spec/latest/json-ld-syntax/</a>",
    "JSON-LD-API": "Markus Lanthaler, Gregg Kellogg, Manu Sporny, Editors. <cite><a href=\"http://json-ld.org/spec/latest/json-ld-api/\">JSON-LD 1.0 Processing Algorithms and API</a>.</cite> W3C Editor's Draft (work in progress). URL: <a href=\"http://json-ld.org/spec/latest/json-ld-api/\">http://json-ld.org/spec/latest/json-ld-api/</a>",
    "JSON-LD-TESTS": "<cite><a href=\"http://dvcs.w3.org/hg/json-ld/raw-file/default/test-suite/\">JSON-LD Test Suite</a></cite> (work in progress).",
    "IEEE-754-1985": "IEEE. <cite>IEEE Standard for Binary Floating-Point Arithmetic.</cite> See <a href=\"http://standards.ieee.org/reading/ieee/std_public/description/busarch/754-1985_desc.html\">http://standards.ieee.org/reading/ieee/std_public/description/busarch/754-1985_desc.html</a>",
    "RFC5988": "M. Nottingham, Editor. <cite><a href=\"http://tools.ietf.org/rfc/rfc5988\">Web Linking</a>.</cite> October 2010. Internet RFC 5988. URL: <a href=\"http://tools.ietf.org/rfc/rfc5988.txt\">http://tools.ietf.org/rfc/rfc5988.txt</a>",
    "RDF-CONCEPTS": "Richard Cyganiak, David Wood, Editors. <cite><a href=\"http://www.w3.org/TR/2013/WD-rdf11-concepts-20130115/\">RDF 1.1 Concepts and Abstract Syntax.</a></cite> 15 January 2013. W3C Working Draft (work in progress). URL: <a href=\"http://www.w3.org/TR/2013/WD-rdf11-concepts-20130115/\">http://www.w3.org/TR/2013/WD-rdf11-concepts-20130115/</a>",
    "TURTLE-TR": "Eric Prud'hommeaux, Gavin Carothers, Editors. <cite><a href=\"http://www.w3.org/TR/2011/WD-turtle-20110809/\">Turtle: Terse RDF Triple Language.</a></cite> 09 August 2011. W3C Working Draft (work in progress). URL: <a href=\"http://www.w3.org/TR/2011/WD-turtle-20110809/\">http://www.w3.org/TR/2011/WD-turtle-20110809/</a>",
    "MICRODATA": "Ian Hickson, Editor. <cite><a href=\"http://www.w3.org/TR/2012/WD-microdata-20120329/\">HTML Microdata</a>.</cite> 29 March 2012. W3C Working Draft (work in progress). URL: <a href=\"http://www.w3.org/TR/2012/WD-microdata-20120329/\">http://www.w3.org/TR/2012/WD-microdata-20120329/</a>"
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
