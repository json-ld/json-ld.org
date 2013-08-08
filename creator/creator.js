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

  $('#form-person .input-large').on('keydown', function(){
	var extended_json = $.extend({},contexts.person,$('#form-person').serializeObject())
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-event .input-large').on('keydown', function(){
	var extended_json = $.extend({},contexts.events,$('#form-event').serializeObject())
	$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
  });

  $('#form-place .input-large').on('keydown', function(){
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