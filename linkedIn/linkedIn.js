var contexts;

$.getJSON('../contexts/linkedIn.jsonld',function(data){
    contexts = data;
});

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
var firstName = "";
var lastName = "";
var email = "";
var response;

user ["@context"] = ["http://json-ld.org/contexts/schema.org.jsonld", "http://json-ld.org/contexts/linkedin.jsonld"]
var msporny = {
  "_total": 1,
  "values": [{
    "_key": "~",
    "connections": {
      "_total": 591
    },
    "educations": {
      "_total": 2,
      "values": [{
        "degree": "BS",
        "endDate": {
          "month": 12,
          "year": 2001
        },
        "fieldOfStudy": "Computer Science",
        "id": 708192,
        "schoolName": "Virginia Tech",
        "startDate": {
          "month": 8,
          "year": 1996
        }
      }, {
        "activities": "",
        "degree": "BS",
        "endDate": {
          "year": 1996
        },
        "fieldOfStudy": "Computer Science",
        "id": 708197,
        "notes": "Completed high school in three years, attended local university for the remaining year.",
        "schoolName": "Marshall University",
        "startDate": {
          "year": 1995
        }
      }]
    },
    "emailAddress": "msporny@digitalbazaar.com",
    "firstName": "Manu",
    "following": {
      "companies": {
        "_total": 5,
        "values": [{
          "id": 13165,
          "name": "W3C"
        }, {
          "id": 1015173,
          "name": "VT Corporate Research Center"
        }, {
          "id": 1247185,
          "name": "Digital Bazaar, Inc."
        }, {
          "id": 1437090,
          "name": "Mogelli"
        }, {
          "id": 1901502,
          "name": "DirectPayNet"
        }]
      },
      "industries": {
        "_total": 2,
        "values": [{
          "id": 6
        }, {
          "id": 4
        }]
      },
      "people": {
        "_total": 0
      },
      "specialEditions": {
        "_total": 0
      }
    },
    "headline": "Founder and CEO of Digital Bazaar - leading the creation of the worlds first universal payment standard for the Web",
    "id": "s8DY7-nuLP",
    "interests": "web platform, web payments, art, science, music, security systems design, cryptography, economic empowerment of younger generations, programming, open source, internet standards, start-ups, emerging technology, motor racing, snowboarding, solar and nuclear power, decentralized systems design, politics, nature, raising children to learn to be driven by their passions - compassionate of others - and to have a positive impact on local and global society.",
    "lastName": "Sporny",
    "location": {
      "country": {
        "code": "us"
      },
      "name": "Roanoke, Virginia Area"
    },
    "memberUrlResources": {
      "_total": 3,
      "values": [{
        "name": "Company Website",
        "url": "http://www.digitalbazaar.com/"
      }, {
        "name": "Blog",
        "url": "http://blog.digitalbazaar.com/"
      }, {
        "name": "Personal Website",
        "url": "http://www.bitmunk.com/"
      }]
    },
    "patents": {
      "_total": 1,
      "values": [{
        "date": {
          "day": 17,
          "month": 7,
          "year": 2012
        },
        "id": 50,
        "title": "Processing data using continuous processing task and binary routine"
      }]
    },
    "phoneNumbers": {
      "_total": 0
    },
    "pictureUrl": "http://m.c.lnkd.licdn.com/mpr/mprx/0_yHCbiqwqTs-KLVTZOW5qinOJiMT85VhZOEn4in4dpyvKsYc4ratwS9uFDc3x6j3NgI8M2Ao61jdE",
    "positions": {
      "_total": 11,
      "values": [{
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "W3C",
          "size": "51-200 employees",
          "type": "Nonprofit"
        },
        "id": 221219327,
        "isCurrent": true,
        "startDate": {
          "month": 8,
          "year": 2011
        },
        "summary": "The purpose of the Web Payments Community Group is to discuss, research,\nprototype, and create working systems that enable Universal Payment for\nthe Web. The goal is to create a safe, decentralized system and a set of\nopen, patent and royalty-free specifications that allow people on the\nWeb to send each other money as easily as they exchange instant messages\nand e-mail today. The group will focus on transforming the way we reward\neach other on the Web as well as how we organize financial resources to\nenhance our personal lives and pursue endeavors that improve upon the\nhuman condition.",
        "title": "Founder and Chair, Web Payments Community Group"
      }, {
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "W3C",
          "size": "51-200 employees",
          "type": "Nonprofit"
        },
        "id": 191740299,
        "isCurrent": true,
        "startDate": {
          "month": 4,
          "year": 2011
        },
        "summary": "Responsible for leading the activity to make RDFa easier to author, publish and develop. Focus is on RDFa Core 1.1, RDFa Lite 1.1, XHTML+RDFa 1.1, XML+RDFa 1.1, HTML4+RDFa 1.1, HTML5+RDFa 1.1, the RDF API, the Structured Data API and the RDFa API.",
        "title": "Chair, RDFa Working Group"
      }, {
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "W3C",
          "size": "51-200 employees",
          "type": "Nonprofit"
        },
        "id": 221217534,
        "isCurrent": true,
        "startDate": {
          "month": 9,
          "year": 2010
        },
        "summary": "JSON-LD is designed as a light-weight syntax that can be used to express Linked Data. It is primarily intended to be a way to use Linked Data in Javascript, Python, Ruby and other Web-based programming environments. It is also useful when building interoperable Web services and when storing Linked Data in JSON-based document storage engines. It is practical and designed to be as simple as possible, utilizing the large number of JSON parsers and libraries available today. It is designed to be able to express key-value pairs, RDF data, RDFa data, Microformats data, and Microdata. That is, it supports every major Web-based structured data model in use today. Duties include organizing bi-monthly teleconferences, providing community direction, ensuring transparency, specification editing and a variety of other tasks involved in running an open standards community.",
        "title": "Founder, Chair, and Lead Editor, JSON-LD Community Group"
      }, {
        "company": {
          "id": 1247185,
          "industry": "Computer Software",
          "name": "Digital Bazaar, Inc.",
          "size": "1-10 employees",
          "type": "Self-Employed"
        },
        "id": 3989522,
        "isCurrent": true,
        "startDate": {
          "month": 11,
          "year": 2002
        },
        "summary": "Digital Bazaar creates technologies, Web standards, and provides services to enable individuals and businesses to buy and sell digital content via the Web. Our technology has been used across industries switching to digital content distribution including the music, television, movie, electronic medial record, and electronic book industries. Our flagship service is Meritora:\n\nhttp://blog.meritora.com/launch/",
        "title": "Founder, CEO and Owner"
      }, {
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "World Wide Web Consortium",
          "size": "51-200 employees",
          "type": "Nonprofit"
        },
        "endDate": {
          "month": 6,
          "year": 2012
        },
        "id": 110937704,
        "isCurrent": false,
        "startDate": {
          "month": 1,
          "year": 2010
        },
        "summary": "Member of the Semantic Web Coordination Group by special invitation, responsible for helping to direct the development of all Semantic Web efforts at the World Wide Web Consortium.",
        "title": "Member, Semantic Web Coordination Group"
      }, {
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "World Wide Web Consortium",
          "type": "Nonprofit"
        },
        "endDate": {
          "month": 3,
          "year": 2011
        },
        "id": 110936846,
        "isCurrent": false,
        "startDate": {
          "month": 2,
          "year": 2010
        },
        "summary": "RDFa helps bloggers and website authors make their web pages smarter by adding machine-readable information to a site. RDFa gives hints to web browsers, which give people more options when interacting with a web page. RDFa enables new interactions such as automatically adding people to address books, adding events to personal calendars, getting directions to a place described by RDFa, or searching online bookstores for a book marked up using RDFa. \n\nRDFa has been adopted and is being actively used by Google, Yahoo, Drupal 7, The Open Document Format (ODF), The Scalable Vector Graphics (SVG) standard, the UK Government, the US Whitehouse, the Public Library of Science, Tesco, Digg, O'Reilly, and Best Buy, to name a few.\n\nI'm primarily responsible for managing the development of RDFa 1.1, RDFa web browser integration, and RDFa in HTML5, SVG and ODF.",
        "title": "Co-Chair, RDFa Working Group"
      }, {
        "company": {
          "industry": "Architecture & Planning",
          "name": "Commons Design Initiative"
        },
        "endDate": {
          "month": 1,
          "year": 2010
        },
        "id": 49462565,
        "isCurrent": false,
        "startDate": {
          "month": 6,
          "year": 2008
        },
        "summary": "The goal of the initiative is to create a community of designers, architects, mechanical engineers, material scientists, software developers, hardware developers, construction engineers, students, teachers and regular everyday folks across the web that have come together to improve the quality of housing available to the world.\n\nThis site is dedicated to the collaborative design, planning, construction and implementation of housing for disaster relief, low income, and low resource clients through cost effective, energy conscious and green movement methodologies.\n\nWe believe in open source designs and implementations. All of the designs, methods and tools generated through the site are available under Creative Commons, Open Source or other licensing methods that promote group learning, collaboration and implementation across the globe.\n\nRegrettably, the project is currently inactive due to other time commitments made by the founders.",
        "title": "Founder"
      }, {
        "company": {
          "id": 13165,
          "industry": "Internet",
          "name": "World Wide Web Consortium",
          "size": "51-200 employees",
          "type": "Nonprofit"
        },
        "endDate": {
          "month": 1,
          "year": 2010
        },
        "id": 38066692,
        "isCurrent": false,
        "startDate": {
          "year": 2007
        },
        "summary": "Worked as an Invited Expert to the Semantic Web Deployment workgroup in the World Wide Web Consortium. Member in the RDF in XHTML Task Force (RDFa).\n\nRDFa helps bloggers and website authors make their web pages smarter by adding computer-readable information, such as information about you, events, places, books or music, to a site. By adding RDFa to your website or blog, you help computers interact with your website in a way that is more helpful to people visiting your site. RDFa makes web browsers smarter by giving people more options when viewing a web page, such as adding you to their address book, adding an event to their calendar, getting directions to a place described by RDFa, or searching online bookstores for a book marked up using RDFa.\n\nI believe that RDFa is the basis for advanced computer-based reasoning (teaching computers to understand human concepts) and is the reason that I have become directly involved in its future direction.",
        "title": "Invited Expert"
      }, {
        "company": {
          "industry": "Hospital & Health Care",
          "name": "Shepherd Medical Systems",
          "size": "1-10 employees",
          "type": "Privately Held"
        },
        "endDate": {
          "month": 2,
          "year": 2006
        },
        "id": 3989784,
        "isCurrent": false,
        "startDate": {
          "month": 3,
          "year": 2005
        },
        "summary": "Led design and implementation of tablet-based electronic health record system targeted at doctors offices and non-hospital locations.",
        "title": "Chief Technology Architect"
      }, {
        "company": {
          "industry": "Defense & Space",
          "name": "Advanced Simulation Technology, Inc."
        },
        "endDate": {
          "month": 8,
          "year": 2005
        },
        "id": 3989788,
        "isCurrent": false,
        "startDate": {
          "month": 5,
          "year": 2005
        },
        "summary": "Managed a small team of developers creating a voice communication system for military and commercial aircraft simulators.",
        "title": "Interim Head of Software Development"
      }, {
        "company": {
          "industry": "Computer Software",
          "name": "xRhino, Inc.",
          "size": "1-10 employees",
          "type": "Privately Held"
        },
        "endDate": {
          "month": 11,
          "year": 2003
        },
        "id": 3989804,
        "isCurrent": false,
        "startDate": {
          "month": 11,
          "year": 2000
        },
        "summary": "Led product development for a Linux development environment for the PlayStation 2. Led product development for a MP3 music player for the PlayStation 2 with an integrated music store.",
        "title": "Director of Product Development"
      }]
    },
    "publicProfileUrl": "http://www.linkedin.com/in/manusporny",
    "skills": {
      "_total": 26,
      "values": [{
        "id": 9,
        "skill": {
          "name": "Web Technologies"
        }
      }, {
        "id": 10,
        "skill": {
          "name": "Distributed Systems"
        }
      }, {
        "id": 11,
        "skill": {
          "name": "Patents"
        }
      }, {
        "id": 12,
        "skill": {
          "name": "Copyright Law"
        }
      }, {
        "id": 13,
        "skill": {
          "name": "Semantic Web"
        }
      }, {
        "id": 14,
        "skill": {
          "name": "Python"
        }
      }, {
        "id": 15,
        "skill": {
          "name": "Open Source"
        }
      }, {
        "id": 16,
        "skill": {
          "name": "JavaScript"
        }
      }, {
        "id": 17,
        "skill": {
          "name": "Web Development"
        }
      }, {
        "id": 18,
        "skill": {
          "name": "Web Applications"
        }
      }, {
        "id": 19,
        "skill": {
          "name": "REST"
        }
      }, {
        "id": 40,
        "skill": {
          "name": "Linked Data"
        }
      }, {
        "id": 41,
        "skill": {
          "name": "Linux"
        }
      }, {
        "id": 42,
        "skill": {
          "name": "Web Services"
        }
      }, {
        "id": 45,
        "skill": {
          "name": "Software Development"
        }
      }, {
        "id": 47,
        "skill": {
          "name": "RDFa"
        }
      }, {
        "id": 68,
        "skill": {
          "name": "Managing Start-ups"
        }
      }, {
        "id": 69,
        "skill": {
          "name": "Web Standards"
        }
      }, {
        "id": 70,
        "skill": {
          "name": "Web Payments"
        }
      }, {
        "id": 71,
        "skill": {
          "name": "JSON-LD"
        }
      }, {
        "id": 72,
        "skill": {
          "name": "Electronic Payments"
        }
      }, {
        "id": 73,
        "skill": {
          "name": "Cryptography"
        }
      }, {
        "id": 74,
        "skill": {
          "name": "Project Management"
        }
      }, {
        "id": 75,
        "skill": {
          "name": "Technical Writing"
        }
      }, {
        "id": 77,
        "skill": {
          "name": "RDF"
        }
      }, {
        "id": 85,
        "skill": {
          "name": "XHTML"
        }
      }]
    },
    "specialties": "Software engineering and design, software/system usability engineering, supercomputer design, high performance graphic computing, virtual reality systems, GIS systems, distributed computing, peer-to-peer system swarming, project management (teams of 3-25), copyright law, high-availability micro-payment financial systems, contract negotiation, patent creation, submission and execution, business law, licensing negotiation and authoring, serial entrepreneur",
    "summary": "Founder/President and CEO of Digital Bazaar, Inc. Background in Computer Science, interests in advancing the state of the art in computing, micro-payment systems, peer-to-peer systems and creating fair systems that compensate individuals for their creative efforts. The culimation and ongoing improvement of this set of interests can be found at:\n\nhttp://payswarm.com/\nhttp://digitalbazaar.com/",
    "twitterAccounts": {
      "_total": 1,
      "values": [{
        "providerAccountId": "20446311",
        "providerAccountName": "manusporny"
      }]
    },
    "volunteer": {
      "causes": {
        "_total": 10,
        "values": [{
          "name": "artsAndCulture"
        }, {
          "name": "children"
        }, {
          "name": "civilRights"
        }, {
          "name": "economicEmpowerment"
        }, {
          "name": "environment"
        }, {
          "name": "health"
        }, {
          "name": "humanRights"
        }, {
          "name": "politics"
        }, {
          "name": "povertyAlleviation"
        }, {
          "name": "scienceAndTechnology"
        }]
      },
      "volunteerExperiences": {
        "_total": 1,
        "values": [{
          "id": 52,
          "organization": {
            "id": 13165,
            "name": "W3C"
          },
          "role": "Specification Editor / Working Group Chair"
        }]
      }
    }
  }]
}
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

    $('#check')
    .off('click')
    .on('click', function(){
        if($('#publicEmail').is(':checked'))
           user["email"] = response.values[0].emailAddress;
        else
            delete user.email;
        displayJsonLd();
    });
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
        response = $.extend({},result);

        result = msporny;

        if (result.values[0].firstName) user["givenName"] = result.values[0].firstName;
        firstName = result.values[0].firstName;

        if (result.values[0].lastName) user["familyName"] = result.values[0].lastName;
        lastName = result.values[0].lastName;

        if (result.values[0].pictureUrl) user["image"] = result.values[0].pictureUrl;

        if (result.values[0].publicProfileUrl) user["profilePage"] = result.values[0].publicProfileUrl;

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
                "@id" : "http://www.linkedin.com/edu/school?id="+ result.values[0].educations.values[i].id,
              "name" : result.values[0].educations.values[i].schoolName}
                alumniOf.push(alumniOfObject);
            };
            user["alumniOf"] = alumniOf;
        }

        if (result.values[0].following) {
            
            if (result.values[0].following.companies) {
                if (result.values[0].following.companies._total > 0) {
                    for (var i = result.values[0].following.companies._total - 1; i >= 0; i--) {
                        if(result.values[0].following.companies.values[i].id !== undefined) {
                            var followsPersonObject = {
                                "@id" : 'http://linkedin.com/companies/' + result.values[0].following.companies.values[i].id,
                                "name" : result.values[0].following.companies.values[i].name
                            }
                        }
                        else {
                            var followsPersonObject = {
                                "name" : result.values[0].following.companies.values[i].name
                            }
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
                        "@id" : result.values[0].memberUrlResources.values[i].url,
                        "name" : result.values[0].memberUrlResources.values[i].name
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
                        if(result.values[0].positions.values[i].company.id) {
                            var worksForObject = {
                                "@id" : 'http://linkedin.com/company/' + result.values[0].positions.values[i].company.id,
                                "name" : result.values[0].positions.values[i].company.name
                            }
                        }
                        else {
                            var worksForObject = {
                                "name" : result.values[0].positions.values[i].company.name
                            }
                        }
                        worksFor.push(worksForObject);
                    }

                    else {
                        if (result.values[0].positions.values[i].company.id) {
                            var pastWorksForObject = {
                                "@id" : 'http://linkedin.com/company/' + result.values[0].positions.values[i].company.id,
                                "name" : result.values[0].positions.values[i].company.name
                            }
                        }
                        else {
                            var pastWorksForObject = {
                            "name" : result.values[0].positions.values[i].company.name
                        }
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
                            "name" : result.values[0].volunteer.causes.values[i].name
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
                            "name" : result.values[0].volunteer.volunteerExperiences.values[i].organization.name
                        }
                        volunteerExperiences.push(volunteerExperiencesObject);
                    }

                    if (volunteerExperiences.length > 0) user["volunteerExperiences"] = volunteerExperiences;
                }
            }
        }
            if (result.values[0].specialties) {
                user["specialties"] = result.values[0].specialties;
            }

            if (result.values[0].summary) {
                user["summary"] = result.values[0].summary;
            }

            if (result.values[0].twitterAccounts._total > 0) {
                 for (var i = result.values[0].twitterAccounts._total - 1; i >= 0; i--) {
                    var twitterAccountsObject = 'http://twitter.com/'+result.values[0].twitterAccounts.values[i].providerAccountName
                    
                    twitterAccounts.push(twitterAccountsObject);
                }
                if (twitterAccounts.length > 0) user["twitterAccounts"] = twitterAccounts;
            }
        email = user["email"] = result.values[0].emailAddress;
        // user["@context"] = contexts;
        
        // console.log(contexts);

        displayJsonLd();
    })
    .error(function(err) {
        alert(err);
    });   
}

function displayJsonLd () {
    jsonld.compact (user, contexts, function(err, extended_json){
        $('#pane1 textarea').val(js_beautify(JSON.stringify(response),{'indent_size': 2}));
        $('#pane2 textarea').val(js_beautify(JSON.stringify(contexts),{'indent_size': 2}));
        $('#json-ld').val(js_beautify(JSON.stringify(user),{'indent_size': 2}));
        $('#SaveJsonLd').attr('href','data:application/ld+json,' + encodeURIComponent(js_beautify(JSON.stringify(user),{'indent_size': 2}))).attr("download",firstName+'_'+lastName+'.jsonld');
        $('#SaveJsonLd').removeProp('disabled');
    });
}
