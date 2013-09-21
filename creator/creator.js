/* Creator.js
 * -----------
 *
 * This converts template.js to contexts and generate the form.
 *
 * @author vikashagrawal1990@gmail.com
*/

var divString = "";
var contexts = {};

// This function serializes the form 
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

  // This section generates the context for each objects defined in template.js
  // Individual objects are treated in individual blocks 

  // Person Block Starts Here //

  contexts.person = {};
  var contextsPersonInnerObject ={};

  contextsPersonInnerObject["xsd"] = "http://www.w3.org/2001/XMLSchema#"
  $.each(Person.fields, function(objectKey, objectValue) {
    if (objectValue.expectedType.indexOf('text') != -1) {
        if(contextsPersonInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPersonInnerObject[objectValue.jsonLdProperty] = "http://schema.org/"+objectValue.jsonLdProperty
        }
    }
    else if (objectValue.expectedType.indexOf('date') != -1 || objectValue.expectedType.indexOf('Date') != -1 ) {
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
    contexts.person["@context"] = "http://json-ld.org/contexts/schema.org.jsonld";  
  });

  // Person Block Ends Here //

  // Event Block Starts Here //

  contexts.events = {};
  var contextsEventInnerObject ={};

  contextsEventInnerObject["xsd"] = "http://www.w3.org/2001/XMLSchema#"
  $.each(Event.fields, function(objectKey, objectValue) {
    if (objectValue.expectedType.indexOf('text') != -1) {
        if(contextsEventInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsEventInnerObject[objectValue.jsonLdProperty] = "http://schema.org/"+objectValue.jsonLdProperty
        }
    }
    else if (objectValue.expectedType.indexOf('date') != -1 || objectValue.expectedType.indexOf('Date') != -1 ) {
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
    contexts.events["@context"] = "http://json-ld.org/contexts/schema.org.jsonld";  
  });

  // Event Block Ends Here //

  // Place Block Starts Here //

  contexts.place = {};
  var contextsPlaceInnerObject ={};

  contextsPlaceInnerObject["xsd"] = "http://www.w3.org/2001/XMLSchema#"
  $.each(Place.fields, function(objectKey, objectValue) {
    if (objectValue.expectedType.indexOf('text') != -1) {
        if(contextsPlaceInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPlaceInnerObject[objectValue.jsonLdProperty] = "http://schema.org/"+objectValue.jsonLdProperty
        }
    }
    else if (objectValue.expectedType.indexOf('date') != -1 || objectValue.expectedType.indexOf('Date') != -1 ) {
        if(contextsPlaceInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPlaceInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "xsd:date"
            }
        }
    }
    else {
        if(contextsPlaceInnerObject[objectValue.jsonLdProperty] == undefined) {
            contextsPlaceInnerObject[objectValue.jsonLdProperty] = {
                "@id":"http://schema.org/"+objectValue.jsonLdProperty,
                "@type": "@id"
            }
        }
    }
    contexts.place["@context"] = "http://json-ld.org/contexts/schema.org.jsonld";  
  });

  // Place Block Ends Here //

  /********************************
    Context Generation Ends Here
  ********************************/

  // This generates the form from template.js

  /********************************
    Form Generation Starts Here
  ********************************/

  // Person Block Start //
  divString = '<fieldset><legend>'+Person.label+'</legend>'
  $.each(Person.fields, function(objectKey, objectValue) {
    divString += '<div class="control-group"><label class="control-label">'+ objectValue.label +'</label>';
    divString += '<div class="controls"><input type="'+objectValue.inputType+'" class="input-xlarge" placeholder="'+objectValue.inputHint+'" name="'+objectValue.jsonLdProperty+'"></div></div>';
  });
  divString += '</fieldset>';

  $('#form-person').append(divString);
  AddDatePicker();

  // Person Block End //

  // Event Block Start //
  divString = '<fieldset><legend>'+Event.label+'</legend>'
  $.each(Event.fields, function(objectKey, objectValue) {
    divString += '<div class="control-group"><label class="control-label">'+ objectValue.label +'</label>';
    divString += '<div class="controls"><input type="'+objectValue.inputType+'" class="input-xlarge" placeholder="'+objectValue.inputHint+'" name="'+objectValue.jsonLdProperty+'"></div></div>';
  });
  divString += '</fieldset>';

  $('#form-event').append(divString);
  AddDatePicker();

  // Event Block End //

  // Place Block Start //
  divString = '<fieldset><legend>'+Place.label+'</legend>'
  $.each(Place.fields, function(objectKey, objectValue) {
    divString += '<div class="control-group"><label class="control-label">'+ objectValue.label +'</label>';
    divString += '<div class="controls"><input type="'+objectValue.inputType+'" class="input-xlarge" placeholder="'+objectValue.inputHint+'" name="'+objectValue.jsonLdProperty+'"></div></div>';
  });
  divString += '</fieldset>';

  $('#form-place').append(divString);
  AddDatePicker();

  // Place Block End //


  /********************************
    Form Generation Ends Here
  ********************************/

  $('#form-person .input-xlarge')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.person,$('#form-person').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('change')
  .on('change', function(){
    var extended_json = $.extend({},contexts.person,$('#form-person').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('input')
  .on('input', function(){
    var extended_json = $.extend({},contexts.person,$('#form-person').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  });
  
  $('#form-event .input-xlarge')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.events,$('#form-event').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('change')
  .on('change', function(){
    var extended_json = $.extend({},contexts.events,$('#form-event').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('input')
  .on('input', function(){
    var extended_json = $.extend({},contexts.events,$('#form-event').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  });

  $('#form-place .input-xlarge')
  .off('keyup')
  .on('keyup', function(){
    var extended_json = $.extend({},contexts.place,$('#form-place').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('change')
  .on('change', function(){
    var extended_json = $.extend({},contexts.place,$('#form-place').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
  })
  .off('input')
  .on('input', function(){
    var extended_json = $.extend({},contexts.place,$('#form-place').serializeObject());
    $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
    validateURLText($(this), $(this).val());
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

function validateURLText(element, string)
{
  if (element.attr('type') == "url") {
    var urlregex = new RegExp( "^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
   
    if(!urlregex.test(string))
    {
      element.css('border-color','#d9230f');
    }
    else
    {
      element.css('border-color','#68afeb');
    }
    if (string.length == 0)
      element.css('border-color','#ccc');
  }
}

// This function adds JQuery UI datepicker to all the input fields and
// changes their input type to text. This is important because input type="date" uses local lang settings
function AddDatePicker () {
  $('input[type="date"]').datepicker({ dateFormat: "yy-mm-dd" });
  $('input[type="date"]').attr('type','text');
}
