<!DOCTYPE html>
<html
  prefix="
    xhv: http://www.w3.org/1999/xhtml/vocab#
    xsd: http://www.w3.org/2001/XMLSchema#
    rdfs: http://www.w3.org/2000/01/rdf-schema#
    dc: http://purl.org/dc/terms/
    vcard: http://www.w3.org/2006/vcard/ns#
    v: http://rdf.data-vocabulary.org/#"
  lang="en" >
  <head>
    <title>JSON-LD - JSON for Linking Data</title>

    <!-- Meta Tags -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

    <!-- Style Sheets -->
    <link rel="stylesheet" type="text/css" href="../static/css/bootstrap/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="../static/css/bootstrap/bootstrap-responsive.css">
    <link rel="stylesheet" type="text/css" href="../static/css/bootstrap/font-awesome.css">
    <link rel="stylesheet" href="../common/prettify.css" type="text/css" />
    <link rel="shortcut icon" href="../favicon.ico" />

    <!-- script tags -->
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-40462488-1', 'json-ld.org');
      ga('send', 'pageview');
    </script>
  </head>

<?php

function getDrafts($spec)
{
    $specStatuses = array('ED', 'FCGS', 'WD', 'CR', 'PR', 'REC');
    $spec .= DIRECTORY_SEPARATOR;

    // Find all drafts and store them in date -> directory form
    $all = array();
    foreach ($specStatuses as $status) {
        $dates = @scandir($status . DIRECTORY_SEPARATOR . $spec);

        if ($dates) {
            foreach ($dates as $date) {
                if ('.' === $date[0]) {
                    continue;
                }

                $all[$date] = $status . DIRECTORY_SEPARATOR . $spec . $date;
            }
        }
    }

    // Sort drafts in descending order
    krsort($all);

    return $all;
}
?>

  <body>
    <div class="navbar navbar-static-top">
      <div class="navbar-inner">
        <div class="row-fluid">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="../"><img src="../images/json-ld-data-24.png" alt="JSON-LD logo"> JSON-LD</a>
          <div class="nav-collapse">
            <ul class="nav">
              <li>
                <a href="../playground/"><span class="icon-beer"></span> Playground</a>
              </li>
              <li>
                <a href="../learn.html"><span class="icon-book"></span> Documentation</a>
              </li>
              <!-- <li><a href="#"><span class="icon-beaker"></span> Developers</a></li> -->
              <li class="dropdown">
                <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                  <span class="icon-folder-open"></span> Specifications <b class="caret"></b>
                </a>
                <ul class="dropdown-menu">
                  <li class="nav-header"><strong>Latest</strong></li>
                  <li><a href="../spec/latest/json-ld/">Syntax</a></li>
                  <li><a href="../spec/latest/json-ld-api/">API</a></li>
                  <li><a href="../spec/latest/json-ld-framing/">Framing</a></li>
                  <li><a href="../spec/latest/rdf-graph-normalization/">Normalization</a></li>
                  <li class="divider"></li>
                  <li class="nav-header"><strong>Previous Drafts</strong></li>
                  <li><a href="../spec#syntax">Syntax</a></li>
                  <li><a href="../spec#api">API</a></li>
                  <li><a href="../spec#framing">Framing</a></li>
                  <li><a href="../spec#normalization">Normalization</a></li>
                </ul>
              </li>
              <li><a href="../images/"><span class="icon-picture"></span> Branding</a></li>
            </ul>
          </div>
          <!--/.nav-collapse -->
        </div>
      </div>
    </div>

    <div class="container">
      <br>
      <h1>Specifications</h1>
      <p>
JSON-LD has been designed to be a modular set of specifications. It consists of
two base specifications: The JSON-LD Syntax and the JSON-LD API. All other
JSON-LD specifications are layered upon the previous two specifications,
allowing the community to build experimental extensions on top of the base
specifications.
      <p>
      <div id="syntax">
      <h2><a href="latest/json-ld/">The JSON-LD Syntax</a></h2>
      <p>
Defines JSON-LD, a JSON-based format to serialize Linked Data. The syntax is
designed to easily integrate into deployed systems that already use JSON,
and provides a smooth upgrade path from JSON to JSON-LD. It is primarily
intended to be a way to use Linked Data in Web-based programming environments,
to build interoperable Web services, and to store Linked Data in JSON-based
storage engines.
      </p>
      <p>
Links to JSON-LD specifications: <a href="latest/json-ld/">Latest</a><?php
$drafts = getDrafts('json-ld') + getDrafts('json-ld-syntax');
foreach ($drafts as $date => $dir) {
   print(", <a href=\"$dir/\">$date</a>");
}
?>
               </div>
               <div id="api">
               <h2><a href="latest/json-ld-api/">The JSON-LD API</a></h2>
               <p>
An Application Programming Interface (API) and a set of algorithms for
programmatic transformations of JSON-LD documents. This API defines algorithms
for applying and removing JSON-LD contexts.
               </p>
               <p>
Links to JSON-LD API specifications: <a href="latest/json-ld-api/">Latest</a><?php

$drafts = getDrafts('json-ld-api');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>
               </div>
               <div id="framing">
               <h2><a href="latest/json-ld-framing/">JSON-LD Framing</a></h2>
               <p>
JSON-LD Framing allows developers to perform <em>query by example</em>
and force a specific tree layout to a JSON-LD document. It allows developers
to restructure data retrieved from the Web according to the specific needs of
their application. Restructuring JSON-LD data before your application processes
it leads to simpler code when processing data from external sources.
               </p>
               <p>
Links to JSON-LD Framing specifications: <a href="latest/json-ld-framing/">Latest</a><?php

$drafts = getDrafts('json-ld-framing');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>

               </div>
               <div id="normalization">
               <h2><a href="latest/rdf-graph-normalization/">RDF Graph Normalization</a></h2>
               <p>
RDF describes a graph-based data model for making claims about the world and
provides the foundation for reasoning upon that graph of information. At times,
it becomes necessary to compare the differences between graphs, digitally
sign graphs, or generate short identifiers for graphs via hashing algorithms.
This document outlines an algorithm for normalizing RDF graphs such that
these operations can be performed on the normalized graphs.
               </p>
               <p>
Links to RDF Graph Normalization specifications: <a href="latest/rdf-graph-normalization/">Latest</a><?php

$drafts = getDrafts('rdf-graph-normalization/');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>

               </div>
               <h2><a href="latest/json-ld-rdf/">JSON-LD RDF API</a></h2>
               <p>
JSON-LD RDF API describes access methods for transforming and abstract RDF
represention into JSON-LD and back.
               </p>
               <p>
Links to JSON-LD RDF API specifications: <a href="latest/json-ld-rdf/">Latest</a><?php

$drafts = getDrafts('json-ld-rdf');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
      </p>

      <hr>
      <div id="footer">
        <p id="copyright">
         Website content released under a <a href="http://creativecommons.org/about/cc0">Creative Commons CC0 Public Domain Dedication</a> except where an alternate is specified.
         Part of the <a href="http://payswarm.com/">PaySwarm</a> standardization initiative.
        </p>
      </div>

    </div> <!-- /container -->

    <!-- script tags -->
    <script type="text/javascript" src="../static/js/bootstrap/bootstrap.js"></script>
    <script type="text/javascript">
      $('#markup,#context,#frame').bind('keyup', function() {
        $('.btn-group > .btn').each(function () {
          $(this).removeClass('active')
        });
      });
    </script>
  </body>
</html>
