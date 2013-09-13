$(document)
.ready(function(){
  $('#saveSchema')
  .off('click')
  .on('click', function() {
    "use strict";
    $('#generatedContext').val('');
    $.ajax({ url: $('#url').val(), 
      success: function(data,response) {
        if(response = "success") {
          $('#fetchedHTML').append(data);
          $('#error').html('');
          if ($('#vocab').prop('checked') == false)
            generateContext(false);
          else if ($('#vocab').prop('checked') == true)
            generateContext(true);
        }
        else
        {
          $('#error').html('').html(response);
        }
      }
    });
  });
});
var intermediateSchema = {};
function generateContext (checkboxChecked) {
  var baseURI = $('#baseIRI').val();
  var schema = {};
  var schemaWithContext = {};
  schemaWithContext["@context"] = {};
  
  var count = 0;
  var divClass = [];
  var divClass = $('#fetchedHTML').find('div[typeof="rdf:Property"]');

  divClass.each(function (objectKey, objectValue) {
    // console.log($(this).find('span[property="rdfs:label"]').text());
    // console.log($(this).find('a[property="http://schema.org/rangeIncludes"]').text());
    if($(this).find('a[property="http://schema.org/rangeIncludes"]').length == 1)
    intermediateSchema[$(this).find('span[property="rdfs:label"]').text()] = $(this).find('a[property="http://schema.org/rangeIncludes"]').text();
    else 
    {
      var tempList = [];
      $(this).find('a[property="http://schema.org/rangeIncludes"]').each(function (k,v) {
        tempList.push(v.innerHTML);
      })
      intermediateSchema[$(this).find('span[property="rdfs:label"]').text()] = tempList;
    }
  });

  if (checkboxChecked == false) {
    $.each(intermediateSchema, function(objectKey, objectValue){
      if(typeof objectValue == "string") {

        if ((objectValue.search('Text') >= 0) ||
            (objectValue.search('Number') >= 0) ||
            (objectValue.search('Integer') >= 0) )
            {
              schema[objectKey] = baseURI+objectKey;
            }
        else if ((objectValue.search('Date') >= 0) ||
            (objectValue.search('DateTime') >= 0) ||
            (objectValue.search('Duration') >= 0) )
            {
              schema[objectKey] = {
                "@id" : baseURI+objectKey,
                "@type" : "xsd:dateTime"
              }
            }
          else {
            schema[objectKey] = {
              "@id" : baseURI+objectKey,
              "@type" : "@id"
            }
          }
      }

      else if(typeof objectValue == "object") {
        for (var i=0; i < objectValue.length; i++) {
          if ((objectValue[i].search('Text') >= 0) ||
            (objectValue[i].search('Number') >= 0) ||
            (objectValue[i].search('Integer') >= 0) )
            {
              schema[objectKey] = baseURI+objectKey;
            }
        else if ((objectValue[i].search('Date') >= 0) ||
            (objectValue[i].search('DateTime') >= 0) ||
            (objectValue[i].search('Duration') >= 0) )
            {
              schema[objectKey] = {
                "@id" : baseURI+objectKey,
                "@type" : "xsd:dateTime"
              }
            }
          else {
            schema[objectKey] = {
              "@id" : baseURI+objectKey,
              "@type" : "@id"
            }
          }
        }
      }
    });
  }

  else
  {
    schema["@vocab"] = $('#vocabURL').val();
    // console.log(intermediateSchema);
    $.each(intermediateSchema, function(objectKey, objectValue){
      if(typeof objectValue == "string") {

        if ((objectValue.search('Text') >= 0) ||
            (objectValue.search('Number') >= 0) ||
            (objectValue.search('Integer') >= 0) )
            {
              // schema[objectKey] = baseURI+objectKey;
            }
        else if ((objectValue.search('Date') >= 0) ||
            (objectValue.search('DateTime') >= 0) ||
            (objectValue.search('Duration') >= 0) )
            {
              schema[objectKey] = {
                "@type" : "xsd:dateTime"
              }
            }
          else {
            schema[objectKey] = {
              "@type" : "@id"
            }
          }
      }

      else if(typeof objectValue == "object") {
        for (var i=0; i < objectValue.length; i++) {
          if ((objectValue[i].search('Text') >= 0) ||
            (objectValue[i].search('Number') >= 0) ||
            (objectValue[i].search('Integer') >= 0) )
            {
              // schema[objectKey] = baseURI+objectKey;
            }
        else if ((objectValue[i].search('Date') >= 0) ||
            (objectValue[i].search('DateTime') >= 0) ||
            (objectValue[i].search('Duration') >= 0) )
            {
              schema[objectKey] = {
                "@id" : baseURI+objectKey,
                "@type" : "xsd:dateTime"
              }
            }
          else {
            schema[objectKey] = {
              "@type" : "@id"
            }
          }
        }
      }
    });
  }
  schema["xsd"] = "http://www.w3.org/2001/XMLSchema#";
  schemaWithContext["@context"] = schema;

  var schemaJSON = JSON.stringify(schemaWithContext);

  $('#generatedContext').val(js_beautify(schemaJSON,{'indent_size': 2}));
  $('#saveJsonLdContext').removeClass('disabled').removeClass('btn-info').addClass('btn-primary');
  $('#saveJsonLdContext').attr('href','data:Application/ld+json,'+encodeURIComponent(js_beautify(schemaJSON,{'indent_size': 2}))).attr("download","schema.org.jsonld");
}
