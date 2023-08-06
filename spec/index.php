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
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css"/>
    <link rel="stylesheet" href="../common/prettify.css" type="text/css" />
    <link rel="shortcut icon" href="../favicon.ico" />

    <!-- script tags -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" async></script>
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
    <nav class="navbar navbar-expand-md sticky-top bg-body">
      <div class="container">
        <a class="navbar-brand active" href="../">
          <img class="align-text-top" src="../images/json-ld-data-24.png" alt="JSON-LD logo">
          JSON-LD
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="../playground/">Playground</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="../learn.html">Documentation</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="../#developers">Developers</a>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Specifications</a>
              <ul class="dropdown-menu">
                <li class="dropdown-header"><strong>W3C Recommendations</strong></li>
                <li><a class="dropdown-item" href="https://www.w3.org/TR/json-ld/">Syntax</a></li>
                <li><a class="dropdown-item" href="https://www.w3.org/TR/json-ld-api/">Processing Algorithms and API</a></li>
                <li><a class="dropdown-item" href="https://www.w3.org/TR/json-ld-framing/">Framing</a></li>
                <li><hr class="dropdown-divider"></li>
                <li class="dropdown-header"><strong>Latest Drafts</strong></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-syntax/">Syntax</a></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-api/">Processing Algorithms and API</a></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-framing/">Framing</a></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-bp/">Best Practices</a></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-streaming/">Streaming</a></li>
                <li><a class="dropdown-item" href="https://json-ld.github.io/json-ld-star/">JSON-LD-star</a></li>
                <li><a class="dropdown-item" href="https://w3c.github.io/json-ld-cbor/">CBOR</a></li>
                <li><a class="dropdown-item" href="https://github.com/w3c/json-ld-rc/">Recommended Context</a></li>
                <li><a class="dropdown-item" href="https://json-ld.github.io/yaml-ld/">YAML-LD</a></li>
                <li><a class="dropdown-item" href="/spec/">1.0 drafts (historic)</a></li>
              </ul>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="../images/">Branding</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container my-4">
      <h1>Specifications</h1>
      <p class="my-4">
JSON-LD has been designed to be a modular set of specifications. It consists of
two base specifications: The JSON-LD Syntax and the JSON-LD API. All other
JSON-LD specifications are layered upon the previous two specifications,
allowing the community to build experimental extensions on top of the base
specifications.
      <p>
      <h2><a href="latest/json-ld/">The JSON-LD Syntax</a></h2>
      <p class="mt-4">
Defines JSON-LD, a JSON-based format to serialize Linked Data. The syntax is
designed to easily integrate into deployed systems that already use JSON,
and provides a smooth upgrade path from JSON to JSON-LD. It is primarily
intended to be a way to use Linked Data in Web-based programming environments,
to build interoperable Web services, and to store Linked Data in JSON-based
storage engines.
      </p>
      <p class="mb-4">
Links to JSON-LD specifications: <a href="latest/json-ld/">Latest</a><?php
$drafts = getDrafts('json-ld') + getDrafts('json-ld-syntax');
foreach ($drafts as $date => $dir) {
   print(", <a href=\"$dir/\">$date</a>");
}
?>
               <h2><a href="latest/json-ld-api/">The JSON-LD API</a></h2>
               <p class="mt-4">
An Application Programming Interface (API) and a set of algorithms for
programmatic transformations of JSON-LD documents. This API defines algorithms
for applying and removing JSON-LD contexts.
               </p>
               <p class="mb-4">
Links to JSON-LD API specifications: <a href="latest/json-ld-api/">Latest</a><?php

$drafts = getDrafts('json-ld-api');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>
               <h2><a href="https://w3c.github.io/json-ld-bp">JSON-LD Best Practices</a></h2>
               <p class="mt-4">
Best practices for publishing JSON-LD and building APIs.
               </p>
               <p class="mb-4">
Links to JSON-LD API specifications: <a href="https://w3c.github.io/json-ld-bp">Latest</a><?php

$drafts = getDrafts('json-ld-api-best-practices');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>
               <h2><a href="latest/json-ld-framing/">JSON-LD Framing</a></h2>
               <p class="mt-4">
JSON-LD Framing allows developers to perform <em>query by example</em>
and force a specific tree layout to a JSON-LD document. It allows developers
to restructure data retrieved from the Web according to the specific needs of
their application. Restructuring JSON-LD data before your application processes
it leads to simpler code when processing data from external sources.
               </p>
               <p class="mb-4">
Links to JSON-LD Framing specifications: <a href="latest/json-ld-framing/">Latest</a><?php

$drafts = getDrafts('json-ld-framing');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
               </p>
               <h2><a href="latest/json-ld-rdf/">JSON-LD RDF API</a></h2>
               <p class="mt-4">
JSON-LD RDF API describes access methods for transforming and abstract RDF
represention into JSON-LD and back.
               </p>
               <p class="mb-4">
Links to JSON-LD RDF API specifications: <a href="latest/json-ld-rdf/">Latest</a><?php

$drafts = getDrafts('json-ld-rdf');

foreach ($drafts as $date => $dir) {
    print(", <a href=\"$dir/\">$date</a>");
}

?>
      </p>
    </div> <!-- /container -->

    <div class="container pt-4 pb-3">
      <footer>
        <p class="text-body-secondary">
          JSON-LD Specifications are covered by the <a href="https://www.w3.org/Consortium/Legal/2015/doc-license">W3C DOCUMENT LICENSE</a> except where an alternate is specified.
          Part of the <a href="http://payswarm.com/">PaySwarm</a> standardization initiative.
        </p>
      </footer>
    </div>

    <!-- script tags -->
    <script type="text/javascript">
      $('#markup,#context,#frame').bind('keyup', function() {
        $('.btn-group > .btn').each(function () {
          $(this).removeClass('active')
        });
      });
    </script>
  </body>
</html>
