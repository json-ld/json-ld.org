var contexts = {
    "@context": {
        "alumniOf": {
            "@id": "http://schema.org/alumniOf",
            "@type": "@id"
        },
        "date": {
            "@id": "http://schema.org/Date",
            "@type": "xsd:date"
        },
        "dateCreated": {
            "@id": "http://schema.org/Date",
            "@type": "xsd:date"
        },
        "familyName": "http://schema.org/familyName",
        "follows": {
            "@id": "http://schema.org/follows",
            "@type": "@id"
        },
        "followsCompanies": {
            "@id": "http://linkedin.com/vocab#followsCompanies",
            "@type": "@id"
        },
        "givenName": "http://schema.org/givenName",
        "homeLocation": {
            "@id": "http://schema.org/Place",
            "@type": "@id"
        },
        "image": {
            "@id": "http://schema.org/image",
            "@type": "@id"
        },
        "jobTitle": "http://schema.org/jobTitle",
        "name": "http://schema.org/name",
        "owns": {
            "@id": "http://schema.org/owns",
            "@type": "@id"
        },
        "pastWorksFor": {
            "@id": "http://linkedin.com/vocab#pastWorksFor",
            "@type": "@id"
        },
        "skills": {
            "@id": "http://linkedin.com/vocab#skills",
            "@type": "@id"
        },
        "specialties": {
            "@id": "http://linkedin.com/vocab#specialties",
            "@type": "@id"
        },
        "summary": {
            "@id": "http://linkedin.com/vocab#summary",
            "@type": "@id"
        },
        "twitterAccounts": {
            "@id": "http://schema.org/ProfilePage",
            "@type": "@id"
        },
        "url": {
            "@id": "http://schema.org/url",
            "@type": "@id"
        },
        "volunteerCauses": {
            "@id": "http://linkedin.com/vocab#volunteerCauses",
            "@type": "@id"
        },
        "volunteerExperiences": {
            "@id": "http://linkedin.com/vocab#volunteerExperiences",
            "@type": "@id"
        },
        "worksFor": {
            "@id": "http://schema.org/worksFor",
            "@type": "@id"
        }
    }
};

var user = {};
var linkedInData = {};
var schemaOrgLinkedInData;
var count = 0;
var alumniOf = [];
var followsPerson = [];
var followsCompanies = [];
var patents = [];
var memberUrlResources = [];
var positions=[];
var skills = [];
var volunteerCauses = [];
var volunteerExperiences = [];
var worksFor = [];
var pastWorksFor = [];
var owns = [];
var twitterAccounts = [];
var extended_json = {};

$(function(){
    $('#advanced-tab').hide();

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

        if (result.values[0].firstName) user["givenName"] = result.values[0].firstName;

        if (result.values[0].lastName) user["familyName"] = result.values[0].lastName;

        if (result.values[0].pictureUrl) user["image"] = result.values[0].pictureUrl;

        if (result.values[0].publicProfileUrl) user["url"] = result.values[0].publicProfileUrl;

        if (result.values[0].location.name) user["homeLocation"] = result.values[0].location.name;

        if (result.values[0].headline) user["description"] = result.values[0].headline;

        if(result.values[0].dateOfBirth) {
            for (i in result.values[0].dateOfBirth) {
          if (result.values[0].dateOfBirth.hasOwnProperty(i)) {
          count++;
          }
            }


            if(count == 3) {
              user["birthDate"] = result.values[0].dateOfBirth.year+'-'+result.values[0].dateOfBirth.month+'-'+result.values[0].dateOfBirth.day;
            }
        }

        if (result.values[0].educations) { 
            for (var i = result.values[0].educations._total-1; i >= 0; i--) {
              var alumniOfObject = {
              "name" : result.values[0].educations.values[i].schoolName}
                alumniOf.push(alumniOfObject);
            };
            user["alumniOf"] = alumniOf;
        }

        if (result.values[0].following) {
            
            if (result.values[0].following.companies) {
                if (result.values[0].following.companies._total > 0) {
                    for (var i = result.values[0].following.companies._total - 1; i >= 0; i--) {
                        var followsPersonObject = {
                            "name" : result.values[0].following.companies.values[i].name
                        }
                        followsCompanies.push(followsPersonObject);
                    }
                    user["followsCompanies"] = followsCompanies;
                }
            }

            if (result.values[0].following.people) {
                if (result.values[0].following.people._total > 0) {
                    for (var i = result.values[0].following.people._total - 1; i >= 0; i--) {
                        var followsPersonObject = {
                            "name" : result.values[0].following.people.values[i].name
                        }
                        followsPerson.push(followsPersonObject);
                    }
                    user["follows"] = followsPerson;
                }
            }
        }

        if (result.values[0].memberUrlResources) {
            if (result.values[0].memberUrlResources._total > 0) {
                for (var i = result.values[0].memberUrlResources._total - 1; i >= 0; i--) {
                    var memberUrlResourcesObject = {
                        "@type" : "http://schema.org/url",
                        "name" : result.values[0].memberUrlResources.values[i].url
                    }

                    memberUrlResources.push(memberUrlResourcesObject);
                }
            }

            if (memberUrlResources.length > 0) owns.push(memberUrlResources);
        }

        if (result.values[0].patents) {
            if(result.values[0].patents !== undefined) {
                if (result.values[0].patents._total > 0) {
                    count = 0;

                    for (var i = result.values[0].patents._total - 1; i >= 0; i--) {

                        if ( result.values[0].patents.values[i].date ) {
                            count = 0;
                            for (j in result.values[0].patents.values[i].date) {
                              if (result.values[0].patents.values[i].date.hasOwnProperty(j)) {
                              count++;
                              }
                            }
                            if (count == 3) {
                                var patentsObject = {
                                "@type" : "http://schema.org/CreativeWork",
                                "name" : result.values[0].patents.values[i].title,
                                "dateCreated" : result.values[0].patents.values[i].date.year +'-'+ result.values[0].patents.values[i].date.month +'-'+ result.values[0].patents.values[i].date.day
                                }
                            }
                            else {
                                var patentsObject = {
                                "@type" : "http://schema.org/CreativeWork",
                                "name" : result.values[0].patents.values[i].title
                                }
                            }
                        }

                        else {
                            var patentsObject = {
                            "@type" : "http://schema.org/CreativeWork",
                            "name" : result.values[0].patents.values[i].title
                            }
                        }
                        patents.push(patentsObject);
                    }
                }
            }

            if (patents.length > 0) owns.push(patents);
        }

        if (owns.length > 0) user["owns"] = owns;

        if (result.values[0].skills) {
            if (result.values[0].skills._total > 0) {
                for (var i = result.values[0].skills._total - 1; i >= 0; i--) {
                    var skillsObject = {
                        "@type" : "http://schema.org/CreativeWork",
                        "name" : result.values[0].skills.values[i].skill.name
                    }
                    skills.push(skillsObject);
                }
                user["skills"] = skills;
            }
        }

        if (result.values[0].positions) {
            if (result.values[0].positions._total > 0) {
                for (var i = result.values[0].positions._total - 1; i >= 0; i--) {
                    if (result.values[0].positions.values[i].isCurrent === true) {
                        var worksForObject = {
                            "name" : result.values[0].positions.values[i].company.name
                        }
                        worksFor.push(worksForObject);
                    }

                    else {
                        var pastWorksForObject = {
                            "@type" : "http://schema.org/Organization",
                            "name" : result.values[0].positions.values[i].company.name
                        }
                        pastWorksFor.push(pastWorksForObject);
                    }
                }
                if (worksFor.length > 0) user["worksFor"] = worksFor;
                if (pastWorksFor.length > 0) user["pastWorksFor"] = pastWorksFor;
           }
        }

        if (result.values[0].volunteer) {
            if (result.values[0].volunteer.causes) {
                if (result.values[0].volunteer.causes._total > 0) {
                    for (var i = result.values[0].volunteer.causes._total - 1; i >= 0; i--) {
                        var volunteerCausesObject = {
                            "name" : result.values[0].volunteer.causes.values[i].name.name
                        }
                        volunteerCauses.push(volunteerCausesObject);
                    }

                    if (volunteerCauses.length > 0) user["volunteerCauses"] = volunteerCauses;
                }
            }

            if (result.values[0].volunteer.volunteerExperiences) {
                if (result.values[0].volunteer.volunteerExperiences._total > 0) {
                    for (var i = result.values[0].volunteer.volunteerExperiences._total - 1; i >= 0; i--) {
                        var volunteerExperiencesObject = {
                            "@type" : "http://schema.org/Organization",
                            "name" : result.values[0].volunteer.volunteerExperiences.values[i].organization
                        }
                        volunteerExperiences.push(volunteerExperiencesObject);
                    }

                    if (volunteerExperiences.length > 0) user["volunteerCauses"] = volunteerExperiences;
                }
            }
        }
            if (result.values[0].specialties) {
                user["specialties"] = result.values[0].volunteer.specialties;
            }

            if (result.values[0].summary) {
                user["summary"] = result.values[0].volunteer.summary;
            }

            if (result.values[0].twitterAccounts._total > 0) {
                 for (var i = result.values[0].twitterAccounts._total - 1; i >= 0; i--) {
                    var twitterAccountsObject = {
                        "url" : 'http://twitter.com/'+result.values[0].twitterAccounts.values[i].providerAccountName
                    }
                    twitterAccounts.push(twitterAccountsObject);
                }
                if (twitterAccounts.length > 0) user["twitterAccounts"] = twitterAccounts;
            }

        user["@context"] = contexts;

        jsonld.compact (user, contexts, function(err, extended_json){
            $('#pane1 textarea').val(js_beautify(JSON.stringify(result),{'indent_size': 2}));
            $('#json-ld').val(js_beautify(JSON.stringify(extended_json),{'indent_size': 2}));
            $('#SaveJsonLd').attr('href','data:Application/octet-stream,' + encodeURIComponent(js_beautify(JSON.stringify(extended_json),{'indent_size': 2})));
            $('#SaveJsonLd').removeProp('disabled');
            });
    })
    .error(function(err) {
        alert(err);
    });   
}
