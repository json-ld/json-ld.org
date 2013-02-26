<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML+RDFa 1.0//EN"
 "http://www.w3.org/MarkUp/DTD/xhtml-rdfa-1.dtd">
<html version="XHTML+RDFa 1.0" xmlns="http://www.w3.org/1999/xhtml"
   xmlns:xhv="http://www.w3.org/1999/xhtml/vocab#"
   xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
   xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
   xmlns:dcterms="http://purl.org/dc/terms/"
   xmlns:vcard="http://www.w3.org/2006/vcard/ns#"
   xmlns:v="http://rdf.data-vocabulary.org/#"
   >
   <head>
      <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
      <title>JSON-LD - Specifications</title>
      <link href="../site.css" rel="stylesheet" type="text/css" />
      <link rel="shortcut icon" href="../favicon.ico" />
   </head>

   <body>
      <div id="container">
         <div id="header">
            <span class="col">
               <img class="banner" src="../images/json-ld-logo-1.png" />
               <img class="banner" src="../images/json-ld-logo-2.png" />
               <img class="banner" src="../images/json-ld-logo-3.png" />
               <h1>Specifications</h1>
            </span>
         </div>

         <div id="content">
            <div class="breadcrumbs"><a href="../">JSON-LD</a> &gt; Specifications</div>
            <div id="info">
               <h1>Specifications</h1>
               <p>The following specifications are sorted in most recent to
               least recent order.</p>

               <h2>The JSON-LD Syntax</h2>
               <ul>
                 <li><a href="latest/json-ld-syntax/">latest</a></li>
<?php

function getDrafts($spec)
{
    $spec .= '/';

    // Find all drafts
    $ed = @scandir('ED/' . $spec);
    $fcgs = @scandir('FCGS/' . $spec);
    $wd = @scandir('WD/' . $spec);

    $all = array();

    // Transform the arrays to date -> directory form
    if ($ed) {
        foreach ($ed as $date) {
            if ('.' === $date[0]) {
                continue;
            }

            $all[$date] = 'ED/' . $spec . $date;
        }
    }

    if ($fcgs) {
        foreach ($fcgs as $date) {
            if ('.' === $date[0]) {
                continue;
            }

            $all[$date] = 'FCGS/' . $spec . $date;
        }
    }

    if ($wd) {
        foreach ($wd as $date) {
            if ('.' === $date[0]) {
                continue;
            }

            $all[$date] = 'WD/' . $spec . $date;
        }
    }

    // Sort draftsin descending order
    krsort($all);

    return $all;
}

$drafts = getDrafts('json-ld-syntax');

foreach ($drafts as $date => $dir) {
    print("                 <li><a href=\"$dir/\">$date</a></li>");
}

?>
               </ul>

               <h2>The JSON-LD API</h2>
               <ul>
                 <li><a href="latest/json-ld-api/">latest</a></li>
<?php

$drafts = getDrafts('json-ld-api');

foreach ($drafts as $date => $dir) {
    print("                 <li><a href=\"$dir/\">$date</a></li>");
}

?>
               </ul>

               <h2>JSON-LD Framing</h2>
               <ul>
                 <li><a href="latest/json-ld-framing/">latest</a></li>
<?php

$drafts = getDrafts('json-ld-framing');

foreach ($drafts as $date => $dir) {
    print("                 <li><a href=\"$dir/\">$date</a></li>");
}

?>
               </ul>


               <h2>RDF Graph Normalization</h2>
               <ul>
                 <li><a href="latest/rdf-graph-normalization/">latest</a></li>
<?php

$drafts = getDrafts('json-ld-rdf');

foreach ($drafts as $date => $dir) {
    print("                 <li><a href=\"$dir/\">$date</a></li>");
}

?>
               </ul>


               <h2>JSON-LD RDF API</h2>
               <ul>
                 <li><a href="latest/json-ld-rdf/">latest</a></li>
<?php

$drafts = getDrafts('rdf-graph-normalization');

foreach ($drafts as $date => $dir) {
    print("                 <li><a href=\"$dir/\">$date</a></li>");
}

?>
               </ul>

            </div>
         </div>

         <div id="footer">
            <p id="copyright">
               Website content released under a <a href="http://creativecommons.org/licenses/by-sa/3.0/">Creative Commons Attribution Share-Alike license</a> except where an alternate is specified.
            </p>
            <p id="legal">
               Part of the <a href="http://payswarm.com/">payswarm.com</a> initiative.
            </p>
         </div>
      </div>
   </body>
</html>
