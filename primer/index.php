<?php
print <<< htmlcode
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
      <title>JSON-LD - Primer</title> 
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
               <h1>Primers</h1>
            </span> 
         </div> 

         <div id="content"> 
            <div class="breadcrumbs"><a href="../">JSON-LD</a> &gt; Primers</div>
            <div id="info"> 
               <h1>Primers</h1> 
               <p>The following primers are sorted in most recent to
               least recent order:</p>
               <ul>
                 <li><a href="latest/">latest</a></li>

htmlcode;

if(is_dir('ED'))
{
   $editorsDrafts = scandir('ED', 1);

   foreach($editorsDrafts as $draft)
   {
      if($draft != "." and $draft != "..")
      {
         print("                 <li><a href=\"ED/$draft/\">$draft</a></li>");
      }
   }
}

print <<< htmlcode
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

htmlcode;

?>

