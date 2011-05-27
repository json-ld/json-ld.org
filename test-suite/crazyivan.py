##
# This is the web service form for the Crazy Ivan JSON-LD Test Harness script.
# License: Creative Commons Attribution Share-Alike
# @author Manu Sporny
import os, os.path
import re
import subprocess
from re import search
import urllib2
from urllib2 import urlopen
import urllib
from rdflib.Graph import Graph
import xml.sax.saxutils
from mod_python import apache

##
# Retrieves all of the test cases from the given test suite manifest URL and
# filters the RDF using the given status filter.
#
# @param base_uri the base URL for the test cases
# @returns a tuple containing all of the filtered test cases including
#          unit test number, title, Host Language URL, and SPARQL URL.
def retrieveTestCases(base_uri):
    # query the master test manifest
    q = """
    PREFIX test: <http://www.w3.org/2006/03/test-description#>
    PREFIX dc:   <http://purl.org/dc/elements/1.1/>
    SELECT ?t ?title ?classification ?expected_results
    FROM <%s>
    WHERE 
    {
    ?t dc:title ?title .
    ?t test:classification ?classification .
    OPTIONAL
    { 
    ?t test:expectedResults ?expected_results .
    }
    }""" % (base_uri + "manifest.ttl")

    # Construct the graph from the given RDF and apply the SPARQL filter above
    g = Graph()
    unittests = []
    for tc, title, classification_url, expected_results in g.query(q):
        classification = classification_url.split("#")[-1]

        matches = search(r'(\d+)', tc)
        num = matches.groups(1)[0]

        if(expected_results == None):
            expected_results = 'true'

        # Generate the input document URLs
        suffix = "xml"
        if hostLanguage in ["xhtml1", "xhtml5"]:
            suffix = "xhtml"
        elif hostLanguage in ["html4", "html5"]:
            suffix = "xhtml"
        elif hostLanguage in ["svgtiny1.2", "svg"]:
            suffix = "svg"

        doc_uri = "%stest-cases/%s." % \
            (base_uri, num)

        unittests.append((int(num),
                          str(title),
                          str(doc_uri + suffix),
                          str(doc_uri + "sparql"),
                          str(classification),
                          str(expected_results)))

    # Sorts the unit tests in unit test number order.
    def sorttests(a, b):
        if(a[0] < b[0]):
            return -1
        elif(a[0] == b[0]):
            return 0
        else:
            return 1

    unittests.sort(sorttests)
          
    return unittests

##
# Performs a SPARQL query given a query and a source URL
#
def performSparqlQuery(req, query):
    rval = False

    # Perform a simple SPARQL query given the input data
    g = Graph()
    result = g.query(query)
    if(req):
        req.write("%s" % str(result.askAnswer[0]).lower())
    else:
        rval = result.askAnswer[0]

    return rval

##
# Performs a given unit test given the RDF extractor URL, sparql engine URL,
# HTML file and SPARQL validation file.
#
# @param rdf_extractor_url The RDF extractor web service.
# @param sparql_engine_url The SPARQL engine URL.
# @param doc_url the HTML file to use as input.
# @param sparql_url the SPARQL validation file to use on the RDF graph.
def performUnitTest(rdf_extractor_url, sparql_engine_url,
                    doc_url, sparql_url, expected_result):
    # Build the RDF extractor URL
    rdf_extract_url = rdf_extractor_url + urllib.quote(doc_url)

    # Build the SPARQL query
    sparql_query = urlopen(sparql_url).read()
    sparql_query = sparql_query.replace("ASK WHERE",
                                        "ASK FROM <%s> WHERE" % \
                                        (rdf_extract_url,))

    # Perform the SPARQL query
    if(sparql_engine_url.find("/test-suite/sparql-query") != -1):
        # If the SPARQL query is to this SPARQL endpoint, do the query
        # internally
        sparql_value = performSparqlQuery(None, sparql_query)
    elif(sparql_engine_url.find("openlinksw") != -1):
        # Build the SPARQLer service URL
        sparql_engine_url += urllib.quote(sparql_query)

        # Call the Virtuoso service
        sparql_engine_result = urlopen(sparql_engine_url).read()

        sparql_value = (sparql_engine_result.find(expected_result) != -1)
    elif(sparql_engine_url.find("sparql.org") != -1):
        # Build the SPARQLer service URL
        sparql_engine_url += urllib.quote(sparql_query)
        sparql_engine_url += "&default-graph-uri=&stylesheet=%2Fxml-to-html.xsl"

        # Call the SPARQLer service
        sparql_engine_result = urlopen(sparql_engine_url).read()

        # TODO: Remove this hack, it's temporary until Michael Hausenblas puts
        #       an "expected SPARQL result" flag into the test manifest.
        query_result = "<boolean>%s</boolean>" % (expected_result,)
        sparql_value = (sparql_engine_result.find(query_result) != -1)

    return sparql_value

##
# Writes all the available test cases.
#
# Writes the test case alternatives for the given URL
def writeTestCaseRetrievalError(req, tc):
    req.write("""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.0//EN"
 "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-1.dtd"> 
<html version="XHTML+RDFa 1.0" xmlns="http://www.w3.org/1999/xhtml"
   xmlns:xhv="http://www.w3.org/1999/xhtml/vocab#"
   xmlns:dcterms="http://purl.org/dc/terms/"
   xmlns:test="http://www.w3.org/2006/03/test-description#"> 
   
   <head> 
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" /> 
      <title>JSON-LD Test Suite: Test Cases</title> 
   </head>
   <body>
   <p>
      There was an error while retrieving the test case. This is often because
      the URL specified points to a test case that doesn't exist: %s
   </p>
   </body>
</html>
""" % (req.unparsed_uri,))

##
# Writes the test case alternatives for the given URL
#
# Writes the test case alternatives for the given URL
def writeTestCaseAlternatives(req, arguments):
    path = req.parsed_uri[-3]
    tc = path[path.rfind("/") + 1:]
    base_uri = req.construct_url( \
        path[0:path.rfind("/test-cases/")] + "/test-cases/")

    filename = arguments.split("/")[-1]
    req.write("""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.0//EN"
 "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-1.dtd"> 
<html version="XHTML+RDFa 1.0" xmlns="http://www.w3.org/1999/xhtml"
   xmlns:xhv="http://www.w3.org/1999/xhtml/vocab#"
   xmlns:dcterms="http://purl.org/dc/terms/"
   xmlns:test="http://www.w3.org/2006/03/test-description#"> 
   
   <head> 
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" /> 
      <title>JSON-LD Test Suite: Select a Test Case Document</title> 
   </head>
   <body>
   <p>
      The following documents are associated with Test Case %s:
      <ul>
         <li><a href="%s%s.json">JSON-LD</li>
         <li><a href="%s%s.sparql">SPARQL for JSON-LD</li>
      </ul>
   </p>
   </body>
</html>""" % (tc,
              base_uri, filename, 
              base_uri, filename))

##
# Writes a test case document for the given URL.
def writeTestCaseDocument(req, path):
    absolute_path = req.parsed_uri[-3]
    base_uri = req.construct_url( \
        absolute_path[0:absolute_path.rfind("/test-cases/")] + "/test-cases/")
    # FIXME: DEBUGging sparql queryies
    base_uri = base_uri.replace("sites.local/", "")
    
    base_path = os.path.join(req.document_root() + 
        absolute_path[0:absolute_path.rfind("/test-suite/")] + "/test-suite/")
    document = path[-1]
    body = ""

    # Generate the filename that resides on disk
    filename = base_path + "/" + os.path.join("tests", document)

    # Check to see if the file exists and extract the body of the document
    if(os.path.exists(filename)):
        bfile = open(filename, "r")
        lines = bfile.readlines()
        body += line
    else:
        req.status = apache.HTTP_NOT_FOUND

    # Create the regular expression to rewrite the contents of the JSON and
    # SPARQL files
    tcpath = base_uri
    jsonre = re.compile("([0-9]{4,4})\.json")
    tcpathre = re.compile("\$TCPATH")

    if(document.endswith(".sparql")):
        req.content_type = "application/sparql-query"
        req.write(tcpathre.sub(tcpath, body))
    elif(document.endswith(".json")):
        req.content_type = "application/json"
        req.write(tcpathre.sub(tcpath, body))
    else:
        req.status = apache.HTTP_NOT_FOUND

##
# Writes the unit test HTML to the given request object.
#
# @param req the HTTP request object.
# @param test a tuple containing the unit test number, JSON file, SPARQL file,
#             and the status of the test.
def writeUnitTestHtml(req, test):
    num = test[0]
    title = test[1]
    doc_url = test[2]
    sparql_url = test[3]
    status = test[4]
    expected_result = test[5]
    formatted_num = "%04i" % (num,)

    req.write("""
<p class=\"unittest\">
[<span id=\"unit-test-status-%i\">
    <a id=\"unit-test-anchor-%i\"
       href=\"javascript:checkUnitTest(%i,'%s','%s','%s')\">
       <span id=\"unit-test-result-%i\">TEST</span></a>
 </span>]
   Test #%i (%s): <span id=\"unit-test-description-%i\">%s</span>
   [<span id=\"unit-test-details-status-%i\">
    <a href=\"javascript:showUnitTestDetails(%i, '%s', '%s')\">show details</a>
     | 
    <a href=\"javascript:hideUnitTestDetails(%i)\">hide details</a>
     |
    <a href=\"test-cases/%s\">source</a>
    </span>
    ]<div style=\"margin-left: 50px\" id=\"unit-test-details-%i\">
    </div>
</p>

""" % (num, num, num, doc_url, sparql_url, expected_result, num, num,
       status, num, title, num, num, doc_url, sparql_url, num, formatted_num, 
       num))

# Returns the HTML encoded version of the given string. This is useful to
# display a plain ASCII text string on a web page.
def htmlEncode(s):
    for code in (('&', '&amp;'), ('<', '&lt;'), ('>', '&gt;'), ('"', '&quot;'),
        ("'", '&#39;'), ("\\n", '<br/>')):
        s = s.replace(code[0], code[1])
    return s

##
# Checks a unit test and outputs a simple unit test result as HTML.
#
# @param req the HTML request object.
# @param num the unit test number.
# @param rdf_extractor_url The RDF extractor web service.
# @param sparql_engine_url The SPARQL engine URL.
# @param doc_url the JSON file to use as input.
# @param sparql_url the SPARQL file to use when validating the RDF graph.
def checkUnitTestHtml(req, num, rdfa_extractor_url, sparql_engine_url,
                      doc_url, sparql_url, expected_result):
    try:
        if(performUnitTest(rdfa_extractor_url, sparql_engine_url,
                           doc_url, sparql_url, expected_result) == True):
            req.write("<span id=\"unit-test-anchor-%s\" style=\"text-decoration: underline; color: #090\" onclick=\"javascript:checkUnitTest(%s, '%s', '%s', '%s')\"><span id='unit-test-result-%s'>PASS</span></span>" % (num, num, doc_url, sparql_url, expected_result, num))
        else:
            req.write("<span id=\"unit-test-anchor-%s\" style=\"text-decoration: underline; font-weight: bold; color: #f00\" onclick=\"javascript:checkUnitTest(%s, '%s', '%s', '%s')\"><span id='unit-test-result-%s'>FAIL</span></span>" % (num, num, doc_url, sparql_url, expected_result, num))
    except Exception, e:
        import traceback 
        testSuitePath = os.path.dirname(req.canonical_filename)
        exceptionText = htmlEncode( \
            traceback.format_exc().replace(testSuitePath, ""))
        req.write(exceptionText)

##
# Outputs the details related to a given unit test given the unit test number,
# RDF extractor URL, sparql engine URL, JSON file and SPARQL validation file.
# The output is written to the req object as HTML.
#
# @param req the HTTP request.
# @param num the unit test number.
# @param rdf_extractor_url The RDF extractor web service.
# @param sparql_engine_url The SPARQL engine URL.
# @param doc_url the JSON file to use as input.
# @param sparql_url the SPARQL validation file to use on the RDF graph.
def retrieveUnitTestDetailsHtml(req, num, rdf_extractor_url, n3_extractor_url,
                                doc_url, sparql_url):
    # Build the RDF extractor URL
    rdf_extract_url = rdf_extractor_url + doc_url

    # Build the N3 extractor URL
    n3_extract_url = n3_extractor_url + doc_url

    # Decode the SPARQL and document URLs
    sparql_url = urllib.unquote(sparql_url)
    doc_url = urllib.unquote(doc_url)

    # Get the SPARQL query
    sparql_text = ""
    try:
        sparql_text = urlopen(sparql_url).read()
    except urllib2.HTTPError:
        sparql_text = "ERROR retrieving " + sparql_url

    # Get the document data
    doc_text = ""
    try:
        doc_text = urlopen(doc_url).read()
    except urllib2.HTTPError:
        doc_text = "ERROR retrieving " + doc_url

    # get the triples in N3 format
    n3_text = ""
    try:
        n3_text = urlopen(n3_extract_url).read()
    except urllib2.HTTPError:
        n3_text = "ERROR retrieving " + n3_extract_url

    # Get the RDF text
    rdf_text = ""
    try:
        rdf_text = urlopen(rdf_extract_url).read()
    except urllib2.HTTPError:
        rdf_text = "ERROR retrieving " + rdf_extract_url

    req.write("""
    <h3>Test #%s Source Document</h3>
    <pre class="code">\n%s\n</pre>
    <em>Source: <a href="%s">%s</a></em>
    <h3>Test #%s N3 (Reference Implementation Triples)</h3>
    <pre class="code">\n%s\n</pre>
    <em>Extracted using: <a href="%s">%s</a></em>
    <h3>Test #%s RDF</h3>
    <pre class="code">\n%s\n</pre>
    <em>Extracted using: <a href="%s">%s</a></em>
    <h3>Test #%s SPARQL Test</h3>
    <pre class="code">\n%s\n</pre>
    <em>Source: <a href="%s">%s</a></em>
    """ % (num, 
           xml.sax.saxutils.escape(doc_text),
           urllib.unquote(doc_url), urllib.unquote(doc_url), 
           num,
           xml.sax.saxutils.escape(n3_text),
           urllib.unquote(n3_extract_url), urllib.unquote(n3_extract_url), 
           num,
           xml.sax.saxutils.escape(rdf_text), 
           urllib.unquote(rdf_extract_url), urllib.unquote(rdf_extract_url), 
           num, 
           xml.sax.saxutils.escape(sparql_text),
           urllib.unquote(sparql_url), urllib.unquote(sparql_url)))

##
# The handler function is what is called whenever an apache call is made.
#
# @param req the HTTP request.
#
# @return apache.OK if there wasn't an error, the appropriate error code if
#         there was a failure.
def handler(req):
    # File that runs an apache test.
    status = apache.OK
  
    puri = req.parsed_uri
    service = puri[-3]
    base_uri = req.construct_url( \
        service[0:service.rfind("/test-suite/")] + "/test-suite/")
    # FIXME: DEBUGging sparql queryies
    base_uri = base_uri.replace("sites.local/", "")
    argstr = puri[-2]
    args = {}

    # Convert all of the arguments from their URL-encoded value to normal text
    if(argstr and len(argstr) > 0):
        if("&" in argstr):
            for kv in argstr.split("&"):
                key, value = kv.split("=", 1)
                args[urllib.unquote(key)] = urllib.unquote(value)
        elif("=" in argstr):
            key, value = argstr.split("=")
            args[urllib.unquote(key)] = urllib.unquote(value)

    # Retrieve a single test case
    req.content_type = 'text/plain'
    if(service.find("/test-suite/test-cases") != -1):
        req.content_type = 'text/html'
        document = service[service.find("test-cases/"):].split("/")
        if(len(document) == 2):
            writeTestCaseAlternatives(req, document[-1])
        elif(len(document) <= 3):
            writeTestCaseRetrievalError(req, document[-1])
        elif(len(document) == 4):
            writeTestCaseDocument(req, document)
        else:
            req.write("ERROR DOCUMENT:" + str(document))

    # Retrieve a test suite
    elif(service.find("/test-suite/retrieve-tests") != -1):
        req.content_type = 'text/html'

        unittests = retrieveTestCases(base_uri)
        for ut in unittests:
            writeUnitTestHtml(req, ut)

    # Check a particular unit test
    elif(service.find("/test-suite/check-test") != -1):
        req.content_type = 'text/html'
        if(args.has_key('id') and args.has_key('source') and
           args.has_key('sparql') and args.has_key('rdfa-extractor') and
           args.has_key('sparql-engine') and args.has_key('expected-result')):
            checkUnitTestHtml(req, args['id'], args['rdfa-extractor'],
                              args['sparql-engine'],
                              args['source'], args['sparql'],
                              args['expected-result'])
        else:
            req.write("ID, RDFA-EXTRACTOR, SPARQL-ENGINE, XHTML and " + \
                      "SPARQL not specified in request to test harness!")
            req.write("ARGS:" + str(args))

    # Retrieve the details about a particular unit test
    elif(service.find("/test-suite/test-details") != -1):
        req.content_type = 'text/html'
        if(args.has_key('id') and args.has_key('source') and
           args.has_key('sparql') and args.has_key('rdfa-extractor') and
           args.has_key('n3-extractor')):
            retrieveUnitTestDetailsHtml(req, args['id'],
                                        args['rdfa-extractor'],
                                        args['n3-extractor'],
                                        args['source'], args['sparql'])
        else:
            req.write("ID, SOURCE, SPARQL, RDFA-EXTRACTOR or N3-EXTRACTOR " + \
                      "was not specified in the request URL to the" + \
                      "test harness: " + service)

    elif(service.find("/test-suite/sparql-query") != -1):
        query = req.read()
        performSparqlQuery(req, query)

    # Perform a git update in the current directory
    elif(service.find("/test-suite/git-update") != -1):
        testSuitePath = os.path.dirname(req.canonical_filename)
        gitUpdatePath = os.path.join(testSuitePath, ".git")
        p = subprocess.Popen(["git", "--git-dir", gitUpdatePath, "pull"], 
            bufsize=4096, stdout=subprocess.PIPE, stderr=subprocess.PIPE, 
            close_fds=True, cwd=testSuitePath)
        (so, se) = p.communicate()
        req.write("GIT status: %s%s" % (so, se))
    else:
        req.content_type = 'text/html'
        req.write("<b>ERROR: Unknown CrazyIvan service: %s</b>" % (service,))

    return status

