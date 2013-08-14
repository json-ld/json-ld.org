var contexts = {
  "@context" : "http://w3id.org/schema"
};

var user = {};

$(function(){
	$('#pane2 textarea').val(js_beautify(JSON.stringify(contexts),{'indent_size': 2}));
});

function onLinkedInLoad() {
  IN.Event.on(IN, "auth", function() { getDetails(); });
}

function getDetails() {
	IN.API.Profile("me")
	.fields(["id", "firstName", "lastName", "pictureUrl", "publicProfileUrl"])
	.result(function(result) {		
		user["name"] = result.values[0].firstName +' '+ result.values[0].lastName;
		user["givenName"] = result.values[0].firstName;
		user["familyName"] = result.values[0].lastName;
		user["image"] = result.values[0].pictureUrl;
		user["url"] = result.values[0].publicProfileUrl;
		var extended_json = $.extend({},contexts,user);
		$('#pane1 textarea').val(js_beautify(JSON.stringify(result),{'indent_size': 2}));
		$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	});	
}