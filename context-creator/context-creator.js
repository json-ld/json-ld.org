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
          generateContext();
        }
        else
        {
          $('#error').html('').html(response);
        }
      }
    });
  });
});

function generateContext () {
  var baseURI = $('#baseIRI').val();
  var schema = {};
  var schemaWithContext = {};
  schemaWithContext["@context"] = {};
  var intermediateSchema = {};
  var count = 0;
  var divClass = []
  // var divClass = document.getElementsByType('rdf:Property');
  // var divClass = $('#fetchedHTML')[0].getElementsByType('rdf:Property');
  var divClass = $('#fetchedHTML').find('div[typeof="rdf:Property"]');

  divClass.each(function (objectKey, objectValue) {
    // console.log($(this).find('span[property="rdfs:label"]').text());
    // console.log($(this).find('a[property="http://schema.org/rangeIncludes"]').text());
    intermediateSchema[$(this).find('span[property="rdfs:label"]').text()] = $(this).find('a[property="http://schema.org/rangeIncludes"]').text();
  });

  $.each(intermediateSchema, function(objectKey, objectValue){
    for (var i = objectValue.length - 1; i >= 0; i--) {
      if (objectValue[i].search(/\/Text$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = baseURI+objectKey;
        }
      }
      else if (objectValue[i].search(/\/Number$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = baseURI+objectKey;
        }
      }
      else if (objectValue[i].search(/\/Date$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = {
            "@id" : baseURI+objectKey,
            "@type" : "xsd:date"
          }
        }
      }
      else if (objectValue[i].search(/\/DateTime$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = {
            "@id" : baseURI+objectKey,
            "@type" : "xsd:dateTime"
          }
        }
      }
      else if (objectValue[i].search(/\/Duration$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = {
            "@id" : baseURI+objectKey,
            "@type" : "xsd:dateTime"
          }
        }
      }
      else if (objectValue[i].search(/\/Integer$/) > 0) {
        if(schema.objectKey === undefined) {
          schema[objectKey] = baseURI+objectKey;
        }
      }
      else 
      {
        if(schema.objectKey === undefined) {
          schema[objectKey] = {
            "@id" : baseURI+objectKey,
            "@type" : "@id"
          }
        }
      }
    };
  });
  schema["xsd"] = "http://www.w3.org/2001/XMLSchema#";
  schemaWithContext["@context"] = schema;

  var schemaJSON = JSON.stringify(schemaWithContext);

  $('#generatedContext').val(js_beautify(schemaJSON,{'indent_size': 2}));
  $('#saveJsonLdContext').removeClass('disabled').removeClass('btn-info').addClass('btn-primary');
  $('#saveJsonLdContext').attr('href','data:Application/ld+json,'+encodeURIComponent(js_beautify(schemaJSON,{'indent_size': 2}))).attr("download","schema.org.jsonld");
}
