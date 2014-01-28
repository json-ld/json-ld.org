// extend the bibliography entries
var localBibliography = {
    "LINKED-DATA": "Tim Berners-Lee. <cite><a href=\"http://www.w3.org/DesignIssues/LinkedData.html\">Linked Data</a></cite>. Personal View, imperfect but published. URL: <a href=\"http://www.w3.org/DesignIssues/LinkedData.html\">http://www.w3.org/DesignIssues/LinkedData.html</a>",
    "JSON-LD": "Manu Sporny, Gregg Kellogg, Markus Lanthaler, Editors. <cite><a href=\"http://www.w3.org/TR/json-ld/\">JSON-LD 1.0</a></cite>. 16 January 2014. W3C Recommendation. URL: <a href=\"http://www.w3.org/TR/json-ld/\">http://www.w3.org/TR/json-ld/</a>",
    "JSON-LD-API": "Markus Lanthaler, Gregg Kellogg, Manu Sporny, Editors. <cite><a href=\"http://www.w3.org/TR/json-ld-api/\">JSON-LD 1.0 Processing Algorithms and API</a></cite>. 16 January 2014. W3C Recommendation. URL: <a href=\"http://www.w3.org/TR/json-ld-api/\">http://www.w3.org/TR/json-ld-api/</a>",
    "JSON-LD-TESTS": "<cite><a href=\"http://www.w3.org/2013/json-ld-tests/\">JSON-LD 1.0 Test Suite</a></cite>. W3C Test Suite. URL: <a href=\"http://www.w3.org/2013/json-ld-tests/\">http://www.w3.org/2013/json-ld-tests/</a>",
    "IEEE-754-2008": "<cite>IEEE 754-2008 Standard for Floating-Point Arithmetic</cite>. URL: <a href=\"http://standards.ieee.org/findstds/standard/754-2008.html\">http://standards.ieee.org/findstds/standard/754-2008.html</a>",
    "RDF11-CONCEPTS": "Richard Cyganiak, David Wood, Markus Lanthaler, Editors. <cite><a href=\"http://www.w3.org/TR/2014/PR-rdf11-concepts-20140109/\">RDF 1.1 Concepts and Abstract Syntax</a></cite>. 9 January 2014. W3C Proposed Recommendation (work in progress). URL: <a href=\"http://www.w3.org/TR/2014/PR-rdf11-concepts-20140109/\">http://www.w3.org/TR/2014/PR-rdf11-concepts-20140109/</a>. The latest edition is available at <a href=\"http://www.w3.org/TR/rdf11-concepts/\">http://www.w3.org/TR/rdf11-concepts/</a>",
    "MICRODATA": "Ian Hickson, Editor. <cite><a href=\"http://www.w3.org/TR/2013/NOTE-microdata-20131029/\">HTML Microdata</a></cite>. 29 October 2013. W3C Working Group Note. URL: <a href=\"http://www.w3.org/TR/2013/NOTE-microdata-20131029/\">http://www.w3.org/TR/2013/NOTE-microdata-20131029/</a>",
    "RFC5988": "M. Nottingham. <cite><a href=\"http://www.ietf.org/rfc/rfc5988.txt\">Web Linking</a></cite>. October 2010. Internet RFC 5988. URL: <a href=\"http://www.ietf.org/rfc/rfc5988.txt\">http://www.ietf.org/rfc/rfc5988.txt</a>",
    "RFC6906": "Erik Wilde. <cite><a href=\"http://www.ietf.org/rfc/rfc6906.txt\">The 'profile' Link Relation Type</a></cite>. March 2013. Internet RFC 6906. URL: <a href=\"http://www.ietf.org/rfc/rfc6906.txt\">http://www.ietf.org/rfc/rfc6906.txt</a>",
    "TURTLE": "Eric Prud'hommeaux, Gavin Carothers, Editors. <cite><a href=\"http://www.w3.org/TR/2014/PR-turtle-20140109/\">RDF 1.1 Turtle: Terse RDF Triple Language</a></cite>. 9 January 2014. W3C Proposed Recommendation (work in progress). URL: <a href=\"http://www.w3.org/TR/2014/PR-turtle-20140109/\">http://www.w3.org/TR/2014/PR-turtle-20140109/</a>. The latest edition is available at <a href=\"http://www.w3.org/TR/turtle/\">http://www.w3.org/TR/turtle/</a>",
    "WEBIDL": "Cameron McCormack, Editor. <cite><a href=\"http://www.w3.org/TR/2012/CR-WebIDL-20120419/\">Web IDL</a></cite>. 19 April 2012. W3C Candidate Recommendation (work in progress). URL: <a href=\"http://www.w3.org/TR/2012/CR-WebIDL-20120419/\">http://www.w3.org/TR/2012/CR-WebIDL-20120419/</a>. The latest edition is available at <a href=\"http://www.w3.org/TR/WebIDL/\">http://www.w3.org/TR/WebIDL/</a>",
    "PROMISES": "Domenic Denicola. <cite><a href=\"https://github.com/domenic/promises-unwrapping\">Promise Objects</a></cite>. January 2014 (work in progress). URL: <a href=\"http://www.w3.org/2013/10/json-ld-api/snapshot-promises-draft\">http://www.w3.org/2013/10/json-ld-api/snapshot-promises-draft</a>. The latest draft is available at <a href=\"https://github.com/domenic/promises-unwrapping\">https://github.com/domenic/promises-unwrapping</a>",
    "RDF11-MT": "Patrick J. Hayes, Peter F. Patel-Schneider, Editors. <cite><a href=\"http://www.w3.org/TR/2014/PR-rdf11-mt-20140109/\">RDF 1.1 Semantics</a></cite>. 9 January 2014. W3C Proposed Recommendation (work in progress). URL: <a href=\"http://www.w3.org/TR/2014/PR-rdf11-mt-20140109/\">http://www.w3.org/TR/2014/PR-rdf11-mt-20140109/</a>. The latest edition is available at <a href=\"http://www.w3.org/TR/rdf11-mt/\">http://www.w3.org/TR/rdf11-mt/</a>",
    "RFC6839": "Tony Hansen, Alexey Melnikov. <cite><a href=\"http://www.ietf.org/rfc/rfc6839.txt\">Additional Media Type Structured Syntax Suffixes</a>.</cite> January 2013. Internet RFC 6839. URL: <a href=\"http://www.ietf.org/rfc/rfc6839.txt\">http://www.ietf.org/rfc/rfc6839.txt</a>",
    "RDF11-SCHEMA": "Dan Brickley; R.V. Guha, Editors. <cite><a href=\"http://www.w3.org/TR/2014/PER-rdf-schema-20140109/\">RDF Schema 1.1</a></cite>. 9 January 2014. W3C Proposed Edited Recommendation (work in progress). URL: <a href=\"http://www.w3.org/TR/2014/PER-rdf-schema-20140109/\">http://www.w3.org/TR/2014/PER-rdf-schema-20140109/</a>. The latest edition is available at <a href=\"http://www.w3.org/TR/rdf-schema/\">http://www.w3.org/TR/rdf-schema/</a>",
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
                ref = ref.replace(/\s+/g, '-').toLowerCase() ;
            }

            if ( tdefs[ref]) {
              throw "Duplicate definition of term '" + ref + "'" ;
            }

            var sp = document.createElement( 'dfn' ) ;
            sp.title = ref ;
            sp.innerHTML = con ;
            sp.id = 'dfn-'+ref;
            tdefs[ref] = '#' + sp.id ;
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
                ref = ref.replace(/\s+/g, '-').toLowerCase() ;
            }
            var href = item.getAttribute('href');
            var className = 'tref internalDFN';
            if (href) {
              tdefs[ref] = href;
              className = 'tref externalDFN';
            }
            if ( !tdefs[ref]) {
              throw "Reference to undefined term '" + ref + "'" ;
            }
            var sp = document.createElement( 'a' ) ;
            var id = item.textContent ;
            sp.className = className ;
            sp.title = ref ;
            sp.innerHTML = con ;
            sp.href= tdefs[ref] ;
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
  content = content.replace(/\*\*\*\*([^*]*)\*\*\*\*/g, '<span class="highlight">$1</span>');
  content = content.replace(/####([^#]*)####/g, '<span class="comment">$1</span>');
  return content ;
}
