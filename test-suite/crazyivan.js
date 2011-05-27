/**
 * This Javascript file is used by the Crazy Ivan JSON-LD Test Harness
 * to process the entire test suite without requiring the developer to
 * leave the page.
 */

/**
 * Sends an XML HTTP request to a given URL and calls a given callback
 * with the data.
 *
 * @param url the URL to call
 * @param callback the callback to call with the returned data.
 * @param postData the data to use when posting to the given URL.
 */
function sendRequest(url, callback, callback_data)
{
   jQuery.get(url, function(data) { callback(data, callback_data); });
}

/**
 * Creates an XML HTTP Object based on the type of browser that the
 * client is using.
 */
function createXMLHTTPObject()
{
   var xmlHttp;

   // get the non-IE (non-ActiveX) version of the xml http object
   // if the object hasn't been acquired yet
   if(xmlHttp == null && typeof XMLHttpRequest !== 'undefined')
   {
      xmlHttp = new XMLHttpRequest();
   }

   return xmlHttp;
}

/**
 * Makes a call to retrieve all of the unit tests that are associated with the
 * selected test suite and status filter.
 */
function retrieveUnitTests()
{
   // note the test cases are loading
   document.getElementById('unit-tests').innerHTML = "<span style=\"font-size: 150%; font-weight: bold; color: #f00\">Test Cases are Loading...</span>";

   // send the HTTP request to the crazy ivan web service
   sendRequest('retrieve-tests', displayUnitTests)
}

/**
 * Displays all of the unit tests.
 *
 * @param req the HTTP request object.
 */
function displayUnitTests(response, callbackData)
{
   document.getElementById('unit-tests').innerHTML = response;
}

/**
 * Performs a check of a unit test given the unit test number, source
 * test file and SPARQL test file.
 *
 * @param num the test case number
 * @param source_url the source test file to use.
 * @param sparql_url the SPARQL test query to use.
 * @param expected_result the expected result of the SPARQL query.
 */
function checkUnitTest(num, source_url, sparql_url, expected_result)
{
   var jldExtractorUrl = getJldExtractorUrl();
   var sparqlEngineUrl = getSparqlEngineUrl();
   
   document.getElementById('unit-test-status-' + num).innerHTML =
      "CHECKING...";
   sendRequest('check-test?id=' + num +
               '&source=' + source_url +
               '&sparql=' + sparql_url +
               '&expected-result=' + expected_result +
               '&jsonld-extractor=' + escape(jldExtractorUrl) +
               '&sparql-engine=' + escape(sparqlEngineUrl),
               displayUnitTestResult, num)
}

/**
 * Shows the details of a particular test case.
 *
 * @param num the unit test ID.
 * @param source_url the document to use for testing.
 * @param sparql_url the SPARQL test query to use.
 * @param jsonld_extractor_url the JSON-LD extractor web service URL.
 * @param n3_extractor_url the N3 extractor web service URL.
 */
function showUnitTestDetails(num, source_url, sparql_url)
{
   var jldExtractorUrl = getJldExtractorUrl();
   var n3ExtractorUrl = "http://www.w3.org/2007/08/pyRdfa/shadowextract?format=n3&uri=";

   document.getElementById('unit-test-details-' + num).innerHTML =
      "Retreiving information...";
   sendRequest('test-details?id=' + num +
               '&source=' + escape(source_url) +
               '&sparql=' + escape(sparql_url) +
               '&jsonld-extractor=' + escape(jldExtractorUrl) +
               '&n3-extractor=' + escape(n3ExtractorUrl),
               displayUnitTestDetailsResult, num)
}

/**
 * Hides the details of the unit test given
 *
 * @param num the unit test number to hide.
 */
function hideUnitTestDetails(num)
{
   document.getElementById('unit-test-details-' + num).innerHTML = "";
}

/**
 * Displays the return value of a unit test result.
 *
 * @param num the unit test number to hide.
 */
function displayUnitTestResult(response, num)
{
   var unitTestId = 'unit-test-status-' + num;

   if(response.length < 512)
   {
      var e = document.getElementById(unitTestId);
      e.innerHTML = response;
   }
   else
   {
      leadingZeros = "";
      if(num < 10)
      {
         leadingZeros = "000";
      }
      else if(num < 100)
      {
         leadingZeros = "00";
      }
      else if(num < 1000)
      {
         leadingZeros = "000";
      }
      else if(num < 10000)
      {
         leadingZeros = "0";
      }

      var formattedNum = leadingZeros + num;
      var baseTcUrl = getBaseTcUrl();
      var htmlUrl = baseTcUrl + formattedNum + ".xhtml";
      var sparqlUrl = baseTcUrl + formattedNum + ".sparql";
      var expectedResult = "true";

      document.getElementById(unitTestId).innerHTML =
         "<a href=\"javascript:checkUnitTest(" + num + ",'" +
    htmlUrl + "','" + sparqlUrl + "','" + expectedResult +
    "')\" style=\"font-weight: bold; color: #f00\">ERROR</a>" +
    "<pre>" + response + "</pre>";
   }
}

/**
 * Displays the return HTML value for the unit test details.
 *
 * @param response the HTTP request object.
 * @param num the unit test number to hide.
 */
function displayUnitTestDetailsResult(response, num)
{
   document.getElementById('unit-test-details-' + num).innerHTML = response;
}

/**
 * Gets the host language identifier for the currently selected test suite.
 *
 * @return the host language identifier for the currently selected test suite.
 */
function getTestSuiteHostLanguage()
{
   var rval = "";
   var testsuite = document.getElementById('test-suite-selection').value;

   languages = ["xml1", "xhtml1", "html4", "html5", "xhtml5", 
      "svgtiny1.2", "svg"];
   
   // check for all languages in the test suite string
   var arrayLength = languages.length;
   for(var i = 0; i < arrayLength; ++i)
   {
      var language = languages[i];
      if(testsuite.indexOf(language) != -1)
      {
         rval = language;
         break;
      }
   }

   return rval;
}

/**
 * Gets the base Test Case URL based on the test manifest.
 *
 * @return the base test case URL containing all of the HTML and SPARQL files.
 */
function getBaseTcUrl()
{
   return 'http://json-ld.digitalbazaar.com/test-suite/test-cases/';
}

/**
 * Gets the currently selected JSON-LD extractor URL.
 *
 * @return The JSON-LD extractor URL.
 */
function getJldExtractorUrl()
{
   var rval = "";
   var extractor = document.getElementById('jsonld-extractor-selection').value;

   if(extractor === "RDF.rb")
   {
      rval = "http://rdf.kellogg-assoc.com/distiller?raw=true&fmt=rdfxml&in_fmt=jsonld&uri="
   }
   else if(extractor === "other")
   {
      rval = document.getElementById('jsonld-extractor-selection-value').value;
   }

   return rval;
}

/**
 * Gets the currently selected SPARQL engine URL.
 *
 * @return the SPARQL engine URL
 */
function getSparqlEngineUrl()
{
   var rval = "";
   var engine = document.getElementById('sparql-engine-selection').value;

   if(engine === "graphene")
   {
      rval = window.location + "sparql-query";
   }
   else if(engine === "sparqler")
   {
      rval = "http://sparql.org/sparql?stylesheet=%2Fxml-to-html.xsl&query=";
   }
   else if(engine === "virtuoso")
   {
      rval = "http://demo.openlinksw.com/sparql/?should-sponge=soft&query=";
   }
   else if(engine === "other")
   {
      rval = document.getElementById('sparql-engine-selection-value').value;
   }

   return rval;
}

/**
 * Update the configuration that is displayed on the web page.
 */
function updateConfigurationDisplay()
{
   var testSuiteManifest = getTestSuiteHostLanguage();
   var jldExtractorUrl = getJldExtractorUrl();
   var sparqlEngineUrl = getSparqlEngineUrl();
   
   document.getElementById('test-suite-selection-value').innerHTML =
      testSuiteManifest;
   document.getElementById('jsonld-extractor-selection-value').value =
      jldExtractorUrl;
   document.getElementById('sparql-engine-selection-value').value =
      sparqlEngineUrl;
}

/**
 * Runs all of the unit tests by calling each anchor element
 * one-by-one.
 */
function performAllUnitTests()
{
   utCount = 0;
   for(var i = 1; i <= 2000; i++)
   {
      var id = "unit-test-anchor-" + i;
      var elem = document.getElementById(id);
      if(elem && elem.href)
      {
         utCount += 1;
         setTimeout(elem.href, (utCount * 1000));
      }
   }
}

/**
 * Generates an EARL report by checking the status of each test and
 */
function generateEarlReport()
{
   var jldExtractorUrl = getJldExtractorUrl();
   var rdftext = '';
   
   rdftext =  '<rdf:RDF xmlns:earl="http://www.w3.org/ns/earl#"\n';   
   rdftext += ' xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"\n';
   rdftext += ' xmlns:dc="http://purl.org/dc/elements/1.1/"\n';
   rdftext += ' xmlns:foaf="http://xmlns.com/foaf/0.1/">\n\n';

   rdftext += '<earl:Software ' +
      'rdf:about="http://json-ld.org/rdfa-test-harness">\n';
   rdftext += ' <dc:title>Crazy Ivan</dc:title>\n';
   rdftext += ' <dc:description>The W3C JSON-LD Test Harness</dc:description>\n';
   rdftext += ' <foaf:homepage ' +
      'rdf:resource="http://json-ld.org/test-harness" />\n';
   rdftext += '</earl:Software>\n\n';

   for(var i = 1; i <= 2000; i++)
   {
      var id = "unit-test-anchor-" + i;
      var elem = document.getElementById(id);
      if(elem)
      {
         // Calculate the proper idString to use when describing the
         // test case numbers.
         idString = "";
         if(i < 10)
         {
            idString = '000' + i;
         }
         else if(i < 100)
         {
            idString = '00' + i;
         }
         else if(i < 1000)
         {
            idString = '0' + i;
         }
         else
         {
            idString = i;
         }
            
         var assertionUrl =
            "http://json-ld.digitalbazaar.com/rdfa-test-harness#" + id
         var tcUrl = 'http://www.w3.org/2011/05/SWD/JSON-LD/testsuite/' +   // FIXME
            'testcases/Test' + idString;
         var tcDescription =
            document.getElementById(id.replace('anchor', 'description'));
         var tcResult =
            document.getElementById(id.replace('anchor', 'result')).innerHTML;
         var resultUrl = 'http://www.w3.org/ns/earl#notTested';

         if(tcResult == "PASS")
         {
            resultUrl = 'http://www.w3.org/ns/earl#pass';
         }
         else if((tcResult == "FAIL") || (tcResult == "ERROR"))
         {
            resultUrl = 'http://www.w3.org/ns/earl#fail';
         }
         
         rdftext += '<earl:TestCase rdf:about="' + tcUrl +'">\n';
         rdftext += ' <dc:title>Test Case #' +
            id.replace('unit-test-anchor-', '') + '</dc:title>\n';
         rdftext += ' <dc:description>' +
            tcDescription.innerHTML + '</dc:description>\n';
         rdftext += '</earl:TestCase>\n';

         rdftext += '<earl:Assertion rdf:about="' +
            assertionUrl.replace('anchor', 'assertion') + '">\n';
         rdftext += ' <earl:assertedBy rdf:resource="http://json-ld.digitalbazaar.com/json-ld-test-harness"/>\n';
         rdftext += ' <earl:subject rdf:resource="' + jldExtractorUrl  +
            '"/>\n';
         rdftext += ' <earl:test rdf:resource="' + tcUrl + '"/>\n';
         rdftext += ' <earl:result rdf:parseType="Resource">\n';
           rdftext += '  <rdf:type ';
         rdftext += 'rdf:resource="http://www.w3.org/ns/earl#TestResult"/>\n';
         rdftext += '  <earl:outcome ';
         rdftext += 'rdf:resource="' + resultUrl + '"/>\n';
         rdftext += ' </earl:result>\n';

         rdftext += '</earl:Assertion>\n\n';
      }
   }
   rdftext += '</rdf:RDF>\n';   

   document.getElementById('earl-report').innerHTML = escapeXml(rdftext);
}

/**
 * Escapes XML-specific codes, such as <, >, & and \t and encodes them
 * into XHTML.
 */
function escapeXml(text)
{
   var rval = '';
   
   var LT = new RegExp("<", "g");  
   var GT = new RegExp(">", "g");  
   var AMP = new RegExp("&", "g");  
   var TAB = new RegExp("\t", "g");
   
   rval = text.replace(AMP,"&amp;").replace(LT, "&lt;").replace(GT, "&gt;").replace(TAB, "   ");

   return rval;
}
