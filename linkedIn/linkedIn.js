var contexts = {
  "@context" : "https://w3id.org/schema"
};

var user = {};
var linkedInData = {};
var schemaOrgLinkedInData;
var count = 0;
var i;

$(function(){
	// $('#advanced-tab').hide();

	$('#advanced').on('click', function(){
	  if($('#advanced-tab').css('display') == 'none') {
	  	$(this).text("Advanced <<<");
		$('#advanced-tab').show();
	  }
	  else {
	  	$(this).text("Advanced >>>");
		$('#advanced-tab').hide();
	  }
	});
	
	$('#pane2 textarea').val(js_beautify(JSON.stringify(contexts),{'indent_size': 2}));
});

function onLinkedInLoad() {
  IN.Event.on(IN, "auth", function() { getDetails(); });
}

function getDetails() {
	IN.API.Profile("me")
	.fields([
	  "id", "firstName", "lastName", "pictureUrl", "publicProfileUrl","location","headline","summary","specialties","positions","emailAddress","interests","publications","patents","languages","skills","certifications","educations","courses","volunteer","following","dateOfBirth","memberUrlResources","phoneNumbers","twitterAccounts","connections","network"
	])
	.result(function(result) {		
		user["firstName"] = result.values[0].firstName;
		user["givenName"] = result.values[0].firstName;
		user["familyName"] = result.values[0].lastName;
		user["image"] = result.values[0].pictureUrl;
		user["url"] = result.values[0].publicProfileUrl;
		user["homeLocation"] = result.values[0].location.name;
		user["description"] = result.values[0].headline;

		for (i in result.values[0].dateOfBirth) {
		  if (result.values[0].dateOfBirth.hasOwnProperty(i)) {
		    count++;
		  }
		}

		if(count == 3) {
		  user["birthDate"] = result.values[0].dateOfBirth.year+'-'+result.values[0].dateOfBirth.month+'-'+result.values[0].dateOfBirth.day;
		}
		count = 0;
		
		var extended_json = $.extend({},contexts,user);
		// if (console != undefined) {console.log(result);}
		// schemaOrgLinkedInData = jsonld.compact(linkedInData, contexts);
		$('#pane1 textarea').val(js_beautify(JSON.stringify(result),{'indent_size': 2}));
		$('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
	})
	.error(function(err) {
      alert(err);
    });	
}