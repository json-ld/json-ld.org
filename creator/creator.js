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

  // Form Person
  
  // Name
  $('#form-person .input-xlarge[name="name"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$(this).serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  // Image
  $('#form-person .input-xlarge[name="image"]').on('keyup', function(e){
  	var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
 	var regex = new RegExp(expression);
 	if($(this).val().match(regex)) {
	  var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	  $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	}
  });

  $('#form-person .input-xlarge[name="address"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-person .input-xlarge[name="email"]').on('keyup', function(e){
	var expression = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
 	var regex = new RegExp(expression);
 	if($(this).val().match(regex)) {
	  var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	  $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	}
  });

  $('#form-person .input-xlarge[name="phone"]').on('keyup', function(e){
	var expression = /^[0-9]+$/;
 	var regex = new RegExp(expression);
 	if($(this).val().match(regex)) {
	  var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	  $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	}
  });

  $('#form-person .input-xlarge[name="gender"]').on('keyup', function(e){
	var expression = /^(?:male|Male|female|Female)$/;
 	var regex = new RegExp(expression);
 	if($(this).val().match(regex)) {
	  var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	  $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	}
  });

  $('#form-person .input-xlarge[name="alumniOf"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-person .input-xlarge[name="nationality"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-person .input-xlarge[name="worksFor"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-person .input-xlarge[name="workLocation"]').on('keyup', function(e){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-person .input-xlarge[name="birthDate"]').datepicker();

  $('#form-person .input-xlarge[name="birthDate"]').on('change', function(){
	var extended_json = $.extend({},contexts,$('#form-person').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  // Form Event

  $('#form-event .input-xlarge').on('keydown', function(e){
	var extended_json = $.extend({},contexts,$('#form-event').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-event .input-xlarge[name="startDate"]').datepicker();

  $('#form-event .input-xlarge[name="startDate"]').on('change', function(){
	var extended_json = $.extend({},contexts,$('#form-event').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-event .input-xlarge[name="endDate"]').datepicker();

  $('#form-event .input-xlarge[name="endDate"]').on('change', function(){
	var extended_json = $.extend({},contexts,$('#form-event').serializeObject());
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  // Form Place
  
  $('#form-place .input-xlarge').on('keydown', function(e){
	var extended_json = $.extend({},contexts,$('#form-place').serializeObject());
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


