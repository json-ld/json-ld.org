/* Web Payments Community Group common spec JavaScript */
var jsonld = {
  // Add as the respecConfig localBiblio variable
  // Extend or override global respec references
  localBiblio: {
    "JSON-LD11CG": {
      title: "JSON-LD 1.1",
      href: "https://json-ld.org/spec/FCGS/json-ld/20180607/",
      authors: ["Gregg Kellogg"],
      publisher: "W3C",
      status: 'CG Final'
    },
    "JSON-LD11CG-API": {
      title: "JSON-LD 1.1 Processing Algorithms and API",
      href: "https://json-ld.org/spec/FCGS/json-ld-api/20180607/",
      authors: ["Gregg Kellogg"],
      publisher: "W3C",
      status: 'CG Final'
    },
    "JSON-LD11CG-FRAMING": {
      title: "JSON-LD 1.1 Framing",
      href: "https://json-ld.org/spec/FCGS/json-ld-framing/20180607/",
      authors: ["Gregg Kellogg"],
      publisher: "W3C",
      status: 'CG Final'
    },
    "JSON-LD-TESTS": {
      title: "JSON-LD 1.1 Test Suite",
      href: "https://json-ld.org/test-suite/",
      authors: ["Gregg Kellogg"],
      publisher: "Linking Data in JSON Community Group"
    },
    // aliases to known references
    "IEEE-754-2008": {
      title: "IEEE 754-2008 Standard for Floating-Point Arithmetic",
      href: "http://standards.ieee.org/findstds/standard/754-2008.html",
      publisher: "Institute of Electrical and Electronics Engineers",
      date: "2008"
    },
    "PROMISES": {
      title: 'Promise Objects',
      href: 'https://github.com/domenic/promises-unwrapping',
      authors: ['Domenic Denicola'],
      status: 'unofficial',
      date: 'January 2014'
    },
    "MICROFORMATS": {
      title: "Microformats",
      href: "http://microformats.org"
    }
  }
};

// We should be able to remove terms that are not actually
// referenced from the common definitions
//
// Add class "preserve" to a definition to ensure it is not removed.
//
// the termlist is in a block of class "termlist", so make sure that
// has an ID and put that ID into the termLists array so we can
// interrogate all of the included termlists later.
var termNames = [] ;
var termLists = [] ;
var termsReferencedByTerms = [] ;

function restrictReferences(utils, content) {
    var base = document.createElement("div");
    base.innerHTML = content;

    // New new logic:
    //
    // 1. build a list of all term-internal references
    // 2. When ready to process, for each reference INTO the terms,
    // remove any terms they reference from the termNames array too.
    $.each(base.querySelectorAll("dfn:not(.preserve)"), function(i, item) {
        var $t = $(item) ;
        var titles = $t.getDfnTitles();
        var n = $t.makeID("dfn", titles[0]);
        if (n) {
            termNames[n] = $t.parent() ;
        }
    });

    var $container = $(".termlist", base) ;
    var containerID = $container.makeID("", "terms") ;
    termLists.push(containerID) ;
    return (base.innerHTML);
}

// add a handler to come in after all the definitions are resolved
//
// New logic: If the reference is within a 'dl' element of
// class 'termlist', and if the target of that reference is
// also within a 'dl' element of class 'termlist', then
// consider it an internal reference and ignore it.

function internalizeTermListReferences() {
    // all definitions are linked; find any internal references
    $(".termlist a.internalDFN").each(function() {
        var $r = $(this);
        var id = $r.attr('href');
        var idref = id.replace(/^#/,"") ;
        if (termNames[idref]) {
            // this is a reference to another term
            // what is the idref of THIS term?
            var $def = $r.closest('dd') ;
            if ($def.length) {
                var $p = $def.prev('dt').find('dfn') ;
                var tid = $p.attr('id') ;
                if (tid) {
                    if (termsReferencedByTerms[tid]) {
                        termsReferencedByTerms[tid].push(idref);
                    } else {
                        termsReferencedByTerms[tid] = [] ;
                        termsReferencedByTerms[tid].push(idref);
                    }
                }
            }
        }
    });

    // clearRefs is recursive.  Walk down the tree of
    // references to ensure that all references are resolved.
    var clearRefs = function(theTerm) {
        if ( termsReferencedByTerms[theTerm] ) {
            $.each(termsReferencedByTerms[theTerm], function(i, item) {
                if (termNames[item]) {
                    delete termNames[item];
                    clearRefs(item);
                }
            });
        };
        // make sure this term doesn't get removed
        if (termNames[theTerm]) {
            delete termNames[theTerm];
        }
    };

    // now termsReferencedByTerms has ALL terms that
    // reference other terms, and a list of the
    // terms that they reference
    $("a.internalDFN").each(function () {
        var $item = $(this) ;
        var t = $item.attr('href');
        var r = t.replace(/^#/,"") ;
        if (r === 'dictionary') {
          var rr = r;
        }
        // if the item is outside the term list
        if ( ! $item.closest('dl.termlist').length ) {
            clearRefs(r);
        }
    });

    // delete any terms that were not referenced.
    Object.keys(termNames).forEach(function(term) {
        var $p = $("#"+term) ;
        if ($p) {
            var tList = $p.getDfnTitles();
            $p.parent().next().remove();
            $p.remove() ;
            tList.forEach(function( item ) {
                if (respecConfig.definitionMap[item]) {
                    delete respecConfig.definitionMap[item];
                }
            });
        }
    });
}

function _esc(s) {
    s = s.replace(/&/g,'&amp;');
    s = s.replace(/>/g,'&gt;');
    s = s.replace(/"/g,'&quot;');
    s = s.replace(/</g,'&lt;');
    return s;
}

function updateExample(doc, content) {
  // perform transformations to make it render and prettier
  content = unComment(doc, content);
  content = _esc(content);
  content = content.replace(/\*\*\*\*([^*]*)\*\*\*\*/g, '<span class="hl-bold">$1</span>');
  content = content.replace(/####([^#]*)####/g, '<span class="comment">$1</span>');
  return content ;
}


function unComment(doc, content) {
  // perform transformations to make it render and prettier
  content = content.replace(/<!--/, '');
  content = content.replace(/-->/, '');
  return content ;
}
