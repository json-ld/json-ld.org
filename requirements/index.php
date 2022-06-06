<?php
print <<< htmlcode
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
            <li><a href="../#developers"><span class="icon-beaker"></span> Developers</a></li>
            <li class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                <span class="icon-folder-open"></span> Specifications <b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                <li class="nav-header"><strong>W3C Recommendations</strong></li>
                <li><a href="https://www.w3.org/TR/json-ld/">Syntax</a></li>
                <li><a href="https://www.w3.org/TR/json-ld-api/">Processing Algorithms and API</a></li>
                <li><a href="https://www.w3.org/TR/json-ld-framing/">Framing</a></li>
                <li class="divider"></li>
                <li class="nav-header"><strong>Latest Drafts</strong></li>
                <li><a href="https://w3c.github.io/json-ld-syntax/">Syntax</a></li>
                <li><a href="https://w3c.github.io/json-ld-api/">Processing Algorithms and API</a></li>
                <li><a href="https://w3c.github.io/json-ld-framing/">Framing</a></li>
                <li><a href="https://w3c.github.io/json-ld-bp/">Best Practices</a></li>
                <li><a href="https://w3c.github.io/json-ld-streaming/">Streaming</a></li>
                  <li><a href="https://json-ld.github.io/json-ld-star/">JSON-LD-star</a></li>
                <li><a href="https://w3c.github.io/json-ld-cbor/">CBOR</a></li>
                <li><a href="https://github.com/w3c/json-ld-rc/">Recommended Context</a></li>
                <li><a href="https://json-ld.github.io/yaml-ld/">YAML-LD</a></li>
                <li><a href="/spec/">1.0 drafts (historic)</a></li>
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
    <div id="content">
      <div id="info">
        <h1>Requirements</h1>
          <p>The following requirements are sorted in most recent to
          least recent order:</p>
          <ul class="nav nav-list">
            <li><a href="latest/">Latest</a></li>

htmlcode;

$editorsDrafts = scandir('ED', 1);

foreach($editorsDrafts as $draft)
{
   if($draft != "." and $draft != "..")
   {
     print("                 <li><a href=\"ED/$draft/\">$draft</a></li>");
   }
}

print <<< htmlcode
          </ul>
        </div>
      </div>
      <hr>
      <div id="footer">
        <p id="copyright">
         Website content released under a <a href="http://creativecommons.org/about/cc0">Creative Commons CC0 Public Domain Dedication</a> except where an alternate is specified.
         Part of the <a href="http://payswarm.com/">PaySwarm</a> standardization initiative.
        </p>
      </div>
    </div> <!-- /container -->
 </body>
</html>

htmlcode;

?>

