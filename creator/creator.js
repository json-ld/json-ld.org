var divString = "";
var contexts = {};
(function() {
  
  $.fn.serializeObject = function()
  {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {             
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
         if(this.value != '') {
           o[this.name] = this.value || '';
         }
      }
    });
    return o;
  };


  /********************************
    Context Generation Starts Here
  ********************************/

  // Person Block Starts Here //

  contexts.person = {};
  var contextsPersonInnerObject ={};

  contextsPersonInnerObject["xsd"] = "http://www.w3.org/2001/XMLSchema#"
  $.each(Event.fields, function(objectKey, objectValue) {
    if (objectValue.inputType.indexOf('text') != -1) {
        if(contextsPersonInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPersonInnerObject[objectValue.jsonLdProperty] = "http://schema.org/"+objectValue.jsonLdProperty
        }
    }
    else if (objectValue.inputType.indexOf('date') != -1 || objectValue.inputType.indexOf('Date') != -1 ) {
        if(contextsPersonInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPersonInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "xsd:date"
            }
        }
    }
    else {
        if(contextsPersonInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPersonInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "@id"
            }
        }
    }
    contexts.person["@context"] = contextsPersonInnerObject;  
  });

  // Person Block Ends Here //

  // Event Block Starts Here //

  contexts.events = {};
  var contextsEventInnerObject ={};

  contextsEventInnerObject["xsd"] = "http://www.w3.org/2001/XMLSchema#"
  $.each(Event.fields, function(objectKey, objectValue) {
    if (objectValue.inputType.indexOf('text') != -1) {
        if(contextsEventInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsEventInnerObject[objectValue.jsonLdProperty] = "http://schema.org/"+objectValue.jsonLdProperty
        }
    }
    else if (objectValue.inputType.indexOf('date') != -1 || objectValue.inputType.indexOf('Date') != -1 ) {
        if(contextsEventInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsEventInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "xsd:date"
            }
        }
    }
    else {
        if(contextsEventInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsEventInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "@id"
            }
        }
    }
    contexts.events["@context"] = contextsEventInnerObject;  
  });

  // Event Block Ends Here //

  /********************************
    Context Generation Ends Here
  ********************************/


  /********************************
    Form Generation Starts Here
  ********************************/

  // Person Block Start //
  divString = '<fieldset><legend>'+Person.label+'</legend>'
  $.each(Person.fields, function(objectKey, objectValue) {
    divString += '<div class="control-group"><label class="control-label">'+ objectValue.label +'</label>';
    divString += '<div class="controls"><input type="'+objectValue.inputType+'" class="input-large" placeholder="'+objectValue.inputHint+'" name="'+objectValue.jsonLdProperty+'"></div></div>';
  });
  divString += '</fieldset>';

  $('#form-person').append(divString);

  // Person Block End //

  // Event Block Start //
  divString = '<fieldset><legend>'+Event.label+'</legend>'
  $.each(Event.fields, function(objectKey, objectValue) {
    divString += '<div class="control-group"><label class="control-label">'+ objectValue.label +'</label>';
    divString += '<div class="controls"><input type="'+objectValue.inputType+'" class="input-large" placeholder="'+objectValue.inputHint+'" name="'+objectValue.jsonLdProperty+'"></div></div>';
  });
  divString += '</fieldset>';

  $('#form-event').append(divString);

  // Event Block End //


  /********************************
    Form Generation Ends Here
  ********************************/

  $('#form-person .input-large')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.person,$('#form-person').serializeObject())
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-event .input-large')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.events,$('#form-event').serializeObject())
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-place .input-large')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.place,$('#form-place').serializeObject())
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });


  $('#form-person').show();
  $('#json-ld').css('height',parseInt($('#form-person').css('height'))-120);
  $('#form-event').hide();
  $('#form-place').hide();

  $('#btn-person').addClass('active');

  $('#btn-person').on('click', function() {
    $('#json-ld').val('{}');
    $('#form-person').show();
    $('#form-event').hide();
    $('#form-place').hide();
    $(this).parent().children().removeClass('active');
    $(this).addClass('active');
  });

  $('#btn-event').on('click', function() {
    $('#json-ld').val('{}');
    $('#form-person').hide();
    $('#form-event').show();
    $('#form-place').hide();
    $(this).parent().children().removeClass('active');
    $(this).addClass('active');
  });

  $('#btn-place').on('click', function() {
    $('#json-ld').val('{}');
    $('#form-person').hide();
    $('#form-event').hide();
    $('#form-place').show();
    $(this).parent().children().removeClass('active');
    $(this).addClass('active');
  });

})();
