/**
 * The JSON-LD Playground example files.
 *
 * @author Manu Sporny <msporny@digitalbazaar.com>
 * @author Dave Longley <dlongley@digitalbazaar.com>
 */
(function($) {
  window.playground = window.playground || {};
  var playground = window.playground;

  // setup the examples and params
  playground.examples = {};
  playground.frames = {};
  playground.contexts = {};

  // add the example of a Patient
  playground.examples["Patient"] =
      {
        "resourceType": "Patient",
        "id": "pat1",
        "text": {
          "status": "generated",
          "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      \n      <p>Patient Donald DUCK @ Acme Healthcare, Inc. MR = 654321</p>\n    \n    </div>"
        },
        "identifier": [
          {
            "use": "usual",
            "type": {
              "coding": [
                {
                  "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
                  "code": "MR"
                }
              ]
            },
            "system": "urn:oid:0.1.2.3.4.5.6.7",
            "value": "654321"
          }
        ],
        "active": true,
        "name": [
          {
            "use": "official",
            "family": "Donald",
            "given": [
              "Duck"
            ]
          }
        ],
        "gender": "male",
        "photo": [
          {
            "contentType": "image/gif",
            "data": "R0lGODlhEwARAPcAAAAAAAAA/+9aAO+1AP/WAP/eAP/eCP/eEP/eGP/nAP/nCP/nEP/nIf/nKf/nUv/nWv/vAP/vCP/vEP/vGP/vIf/vKf/vMf/vOf/vWv/vY//va//vjP/3c//3lP/3nP//tf//vf///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH5BAEAAAEALAAAAAATABEAAAi+AAMIDDCgYMGBCBMSvMCQ4QCFCQcwDBGCA4cLDyEGECDxAoAQHjxwyKhQAMeGIUOSJJjRpIAGDS5wCDly4AALFlYOgHlBwwOSNydM0AmzwYGjBi8IHWoTgQYORg8QIGDAwAKhESI8HIDgwQaRDI1WXXAhK9MBBzZ8/XDxQoUFZC9IiCBh6wEHGz6IbNuwQoSpWxEgyLCXL8O/gAnylNlW6AUEBRIL7Og3KwQIiCXb9HsZQoIEUzUjNEiaNMKAAAA7"
          }
        ],
        "contact": [
          {
            "relationship": [
              {
                "coding": [
                  {
                    "system": "http://terminology.hl7.org/CodeSystem/v2-0131",
                    "code": "E"
                  }
                ]
              }
            ],
            "organization": {
              "reference": "Organization/1",
              "display": "Walt Disney Corporation"
            }
          }
        ],
        "managingOrganization": {
          "reference": "Organization/1",
          "display": "ACME Healthcare, Inc"
        },
        "link": [
          {
            "other": {
              "reference": "Patient/pat2"
            },
            "type": "seealso"
          }
        ]
      };

  // add the example of a Observation
  playground.examples["Observation"] =
      {
        "resourceType": "Observation",
        "id": "f001",
        "text": {
          "status": "generated",
          "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: f001</p><p><b>identifier</b>: 6323 (OFFICIAL)</p><p><b>status</b>: final</p><p><b>code</b>: Glucose [Moles/volume] in Blood <span>(Details : {LOINC code '15074-8' = 'Glucose [Moles/volume] in Blood', given as 'Glucose [Moles/volume] in Blood'})</span></p><p><b>subject</b>: <a>P. van de Heuvel</a></p><p><b>effective</b>: Apr 2, 2013 9:30:10 AM --&gt; (ongoing)</p><p><b>issued</b>: Apr 3, 2013 3:30:10 PM</p><p><b>performer</b>: <a>A. Langeveld</a></p><p><b>value</b>: 6.3 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></p><p><b>interpretation</b>: High <span>(Details : {http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation code 'H' = 'High', given as 'High'})</span></p><h3>ReferenceRanges</h3><table><tr><td>-</td><td><b>Low</b></td><td><b>High</b></td></tr><tr><td>*</td><td>3.1 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></td><td>6.2 mmol/l<span> (Details: UCUM code mmol/L = 'mmol/L')</span></td></tr></table></div>"
        },
        "identifier": [
          {
            "use": "official",
            "system": "http://www.bmc.nl/zorgportal/identifiers/observations",
            "value": "6323"
          }
        ],
        "status": "final",
        "code": {
          "coding": [
            {
              "system": "http://loinc.org",
              "code": "15074-8",
              "display": "Glucose [Moles/volume] in Blood"
            }
          ]
        },
        "subject": {
          "reference": "Patient/f001",
          "display": "P. van de Heuvel"
        },
        "effectivePeriod": {
          "start": "2013-04-02T09:30:10+01:00"
        },
        "issued": "2013-04-03T15:30:10+01:00",
        "performer": [
          {
            "reference": "Practitioner/f005",
            "display": "A. Langeveld"
          }
        ],
        "valueQuantity": {
          "value": 6.3,
          "unit": "mmol/l",
          "system": "http://unitsofmeasure.org",
          "code": "mmol/L"
        },
        "interpretation": [
          {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                "code": "H",
                "display": "High"
              }
            ]
          }
        ],
        "referenceRange": [
          {
            "low": {
              "value": 3.1,
              "unit": "mmol/l",
              "system": "http://unitsofmeasure.org",
              "code": "mmol/L"
            },
            "high": {
              "value": 6.2,
              "unit": "mmol/l",
              "system": "http://unitsofmeasure.org",
              "code": "mmol/L"
            }
          }
        ]
      };

  // add the example of a CodeSystem
  playground.examples["CodeSystem"] =
      {
        "resourceType": "CodeSystem",
        "id": "example",
        "meta": {
          "profile": [
            "http://hl7.org/fhir/StructureDefinition/shareablecodesystem"
          ]
        },
        "text": {
          "status": "generated",
          "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n      <p>CodeSystem &quot;ACME Codes for Cholesterol&quot;: This is an example code system that includes \n        all the codes for serum cholesterol defined by ACME inc.</p>\n      <p>Developed by: FHIR project team (example)</p>\n      <p>Published for testing on 28-Jan 2016</p>\n      <p>This code system defines all the ACME codes for serum cholesterol:</p>\n      <table class=\"grid\">\n        <tr>\n          <td>\n            <b>Code</b>\n          </td>\n          <td>\n            <b>Display</b>\n          </td>\n          <td>\n            <b>Definition</b>\n          </td>\n        </tr>\n        <tr>\n          <td>chol-mmol</td>\n          <td>SChol (mmol/L)</td>\n          <td>Serum Cholesterol, in mmol/L</td>\n        </tr>\n        <tr>\n          <td>chol-mass</td>\n          <td>SChol (mg/L)</td>\n          <td>Serum Cholesterol, in mg/L</td>\n        </tr>\n        <tr>\n          <td>chol</td>\n          <td>SChol</td>\n          <td>Serum Cholesterol</td>\n        </tr>\n      </table>\n    </div>"
        },
        "url": "http://hl7.org/fhir/CodeSystem/example",
        "identifier": [
          {
            "system": "http://acme.com/identifiers/codesystems",
            "value": "internal-cholesterol-inl"
          }
        ],
        "version": "20160128",
        "name": "ACMECholCodesBlood",
        "title": "ACME Codes for Cholesterol in Serum/Plasma",
        "status": "draft",
        "experimental": true,
        "date": "2016-01-28",
        "publisher": "Acme Co",
        "contact": [
          {
            "name": "FHIR project team",
            "telecom": [
              {
                "system": "url",
                "value": "http://hl7.org/fhir"
              }
            ]
          }
        ],
        "description": "This is an example code system that includes all the ACME codes for serum/plasma cholesterol from v2.36.",
        "caseSensitive": true,
        "content": "complete",
        "filter": [
          {
            "code": "acme-plasma",
            "description": "An internal filter used to select codes that are only used with plasma",
            "operator": [
              "="
            ],
            "value": "the value of this filter is either 'true' or 'false'"
          }
        ],
        "concept": [
          {
            "code": "chol-mmol",
            "display": "SChol (mmol/L)",
            "definition": "Serum Cholesterol, in mmol/L",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "From ACME POC Testing"
              }
            ]
          },
          {
            "code": "chol-mass",
            "display": "SChol (mg/L)",
            "definition": "Serum Cholesterol, in mg/L",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "From Paragon Labs"
              }
            ]
          },
          {
            "code": "chol",
            "display": "SChol",
            "definition": "Serum Cholesterol",
            "designation": [
              {
                "use": {
                  "system": "http://acme.com/config/fhir/codesystems/internal",
                  "code": "internal-label"
                },
                "value": "Obdurate Labs uses this with both kinds of units..."
              }
            ]
          }
        ]
      };

  // add the example of a Medication
  playground.examples["Medication"] =
      {
        "resourceType": "Medication",
        "id": "med0301",
        "text": {
          "status": "generated",
          "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: med0301</p><p><b>contained</b>: </p><p><b>code</b>: Vancomycin Hydrochloride (VANCOMYCIN HYDROCHLORIDE) <span>(Details : {http://hl7.org/fhir/sid/ndc code '0409-6531-02' = '10 VIAL in 1 TRAY (0409-6531-02)  &gt; 1 INJECTION, POWDER, LYOPHILIZED, FOR SOLUTION in 1 VIAL', given as 'Vancomycin Hydrochloride (VANCOMYCIN HYDROCHLORIDE)'})</span></p><p><b>status</b>: active</p><p><b>manufacturer</b>: id: org4; name: Pfizer Laboratories Div Pfizer Inc</p><p><b>doseForm</b>: Injection Solution (qualifier value) <span>(Details : {SNOMED CT code '385219001' = 'Injection solution', given as 'Injection Solution (qualifier value)'})</span></p><h3>Ingredients</h3><table><tr><td>-</td><td><b>Item[x]</b></td><td><b>IsActive</b></td><td><b>Strength[x]</b></td></tr><tr><td>*</td><td>Vancomycin Hydrochloride <span>(Details : {RxNorm code '66955' = 'Vancomycin Hydrochloride', given as 'Vancomycin Hydrochloride'})</span></td><td>true</td><td>500 mg<span> (Details: UCUM code mg = 'mg')</span>/10 mL<span> (Details: UCUM code mL = 'mL')</span></td></tr></table><h3>Batches</h3><table><tr><td>-</td><td><b>LotNumber</b></td><td><b>ExpirationDate</b></td></tr><tr><td>*</td><td>9494788</td><td>2017-05-22</td></tr></table></div>"
        },
        "contained": [
          {
            "resourceType": "Organization",
            "id": "org4",
            "name": "Pfizer Laboratories Div Pfizer Inc"
          }
        ],
        "code": {
          "coding": [
            {
              "system": "http://hl7.org/fhir/sid/ndc",
              "code": "0409-6531-02",
              "display": "Vancomycin Hydrochloride (VANCOMYCIN HYDROCHLORIDE)"
            }
          ]
        },
        "status": "active",
        "manufacturer": {
          "reference": "#org4"
        },
        "doseForm": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "385219001",
              "display": "Injection Solution (qualifier value)"
            }
          ]
        },
        "ingredient": [
          {
            "itemCodeableConcept": {
              "coding": [
                {
                  "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                  "code": "66955",
                  "display": "Vancomycin Hydrochloride"
                }
              ]
            },
            "isActive": true,
            "strengthRatio": {
              "numerator": {
                "value": 500,
                "system": "http://unitsofmeasure.org",
                "code": "mg"
              },
              "denominator": {
                "value": 10,
                "system": "http://unitsofmeasure.org",
                "code": "mL"
              }
            }
          }
        ],
        "batch": {
          "lotNumber": "9494788",
          "expirationDate": "2017-05-22"
        }
      };

  // add the example of a AllergyIntolerance
  playground.examples["AllergyIntolerance"] =
      {
        "resourceType": "AllergyIntolerance",
        "id": "example",
        "text": {
          "status": "generated",
          "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: example</p><p><b>identifier</b>: 49476534</p><p><b>clinicalStatus</b>: Active <span>(Details : {http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical code 'active' = 'Active', given as 'Active'})</span></p><p><b>verificationStatus</b>: Confirmed <span>(Details : {http://terminology.hl7.org/CodeSystem/allergyintolerance-verification code 'confirmed' = 'Confirmed', given as 'Confirmed'})</span></p><p><b>type</b>: allergy</p><p><b>category</b>: food</p><p><b>criticality</b>: high</p><p><b>code</b>: Cashew nuts <span>(Details : {SNOMED CT code '227493005' = 'Cashew nuts', given as 'Cashew nuts'})</span></p><p><b>patient</b>: <a>Patient/example</a></p><p><b>onset</b>: 2004</p><p><b>recordedDate</b>: Oct 9, 2014 2:58:00 PM</p><p><b>recorder</b>: <a>Practitioner/example</a></p><p><b>asserter</b>: <a>Patient/example</a></p><p><b>lastOccurrence</b>: 2012-06</p><p><b>note</b>: The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract.</p><blockquote><p><b>reaction</b></p><p><b>substance</b>: cashew nut allergenic extract Injectable Product <span>(Details : {RxNorm code '1160593' = 'cashew nut allergenic extract Injectable Product', given as 'cashew nut allergenic extract Injectable Product'})</span></p><p><b>manifestation</b>: Anaphylactic reaction <span>(Details : {SNOMED CT code '39579001' = 'Anaphylaxis', given as 'Anaphylactic reaction'})</span></p><p><b>description</b>: Challenge Protocol. Severe reaction to subcutaneous cashew extract. Epinephrine administered</p><p><b>onset</b>: 2012-06-12</p><p><b>severity</b>: severe</p><p><b>exposureRoute</b>: Subcutaneous route <span>(Details : {SNOMED CT code '34206005' = 'Subcutaneous route', given as 'Subcutaneous route'})</span></p></blockquote><blockquote><p><b>reaction</b></p><p><b>manifestation</b>: Urticaria <span>(Details : {SNOMED CT code '64305001' = 'Urticaria', given as 'Urticaria'})</span></p><p><b>onset</b>: 2004</p><p><b>severity</b>: moderate</p><p><b>note</b>: The patient reports that the onset of urticaria was within 15 minutes of eating cashews.</p></blockquote></div>"
        },
        "identifier": [
          {
            "system": "http://acme.com/ids/patients/risks",
            "value": "49476534"
          }
        ],
        "clinicalStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              "code": "active",
              "display": "Active"
            }
          ]
        },
        "verificationStatus": {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
              "code": "confirmed",
              "display": "Confirmed"
            }
          ]
        },
        "type": "allergy",
        "category": [
          "food"
        ],
        "criticality": "high",
        "code": {
          "coding": [
            {
              "system": "http://snomed.info/sct",
              "code": "227493005",
              "display": "Cashew nuts"
            }
          ]
        },
        "patient": {
          "reference": "Patient/example"
        },
        "onsetDateTime": "2004",
        "recordedDate": "2014-10-09T14:58:00+11:00",
        "recorder": {
          "reference": "Practitioner/example"
        },
        "asserter": {
          "reference": "Patient/example"
        },
        "lastOccurrence": "2012-06",
        "note": [
          {
            "text": "The criticality is high becasue of the observed anaphylactic reaction when challenged with cashew extract."
          }
        ],
        "reaction": [
          {
            "substance": {
              "coding": [
                {
                  "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
                  "code": "1160593",
                  "display": "cashew nut allergenic extract Injectable Product"
                }
              ]
            },
            "manifestation": [
              {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "39579001",
                    "display": "Anaphylactic reaction"
                  }
                ]
              }
            ],
            "description": "Challenge Protocol. Severe reaction to subcutaneous cashew extract. Epinephrine administered",
            "onset": "2012-06-12",
            "severity": "severe",
            "exposureRoute": {
              "coding": [
                {
                  "system": "http://snomed.info/sct",
                  "code": "34206005",
                  "display": "Subcutaneous route"
                }
              ]
            }
          },
          {
            "manifestation": [
              {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "64305001",
                    "display": "Urticaria"
                  }
                ]
              }
            ],
            "onset": "2004",
            "severity": "moderate",
            "note": [
              {
                "text": "The patient reports that the onset of urticaria was within 15 minutes of eating cashews."
              }
            ]
          }
        ]
      };

  // add the example of bundle (embedded resourceType)
  playground.examples["Bundle"] =
      {
          "resourceType": "Bundle",
          "id": "bundle-example",
          "meta": {
              "lastUpdated": "2014-08-18T01:43:30Z",
              "tag": [
                  {
                      "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
                      "code": "HTEST",
                      "display": "test health data"
                  }
              ]
          },
          "type": "searchset",
          "total": 3,
          "link": [
              {
                  "relation": "self",
                  "url": "https://example.com/base/MedicationRequest?patient\u003d347\u0026_include\u003dMedicationRequest.medication\u0026_count\u003d2"
              },
              {
                  "relation": "next",
                  "url": "https://example.com/base/MedicationRequest?patient\u003d347\u0026searchId\u003dff15fd40-ff71-4b48-b366-09c706bed9d0\u0026page\u003d2"
              }
          ],
          "entry": [
              {
                  "fullUrl": "https://example.com/base/MedicationRequest/3123",
                  "resource": {
                      "resourceType": "MedicationRequest",
                      "id": "3123",
                      "text": {
                          "status": "generated",
                          "div": "\u003cdiv xmlns\u003d\"http://www.w3.org/1999/xhtml\"\u003e\u003cp\u003e\u003cb\u003eGenerated Narrative with Details\u003c/b\u003e\u003c/p\u003e\u003cp\u003e\u003cb\u003eid\u003c/b\u003e: 3123\u003c/p\u003e\u003cp\u003e\u003cb\u003estatus\u003c/b\u003e: unknown\u003c/p\u003e\u003cp\u003e\u003cb\u003eintent\u003c/b\u003e: order\u003c/p\u003e\u003cp\u003e\u003cb\u003emedication\u003c/b\u003e: \u003ca\u003eMedication/example\u003c/a\u003e\u003c/p\u003e\u003cp\u003e\u003cb\u003esubject\u003c/b\u003e: \u003ca\u003ePatient/347\u003c/a\u003e\u003c/p\u003e\u003c/div\u003e"
                      },
                      "status": "unknown",
                      "intent": "order",
                      "medicationReference": {
                          "reference": "Medication/example"
                      },
                      "subject": {
                          "reference": "Patient/347"
                      }
                  },
                  "search": {
                      "mode": "match",
                      "score": 1
                  }
              },
              {
                  "fullUrl": "https://example.com/base/Medication/example",
                  "resource": {
                      "resourceType": "Medication",
                      "id": "example",
                      "text": {
                          "status": "generated",
                          "div": "\u003cdiv xmlns\u003d\"http://www.w3.org/1999/xhtml\"\u003e\u003cp\u003e\u003cb\u003eGenerated Narrative with Details\u003c/b\u003e\u003c/p\u003e\u003cp\u003e\u003cb\u003eid\u003c/b\u003e: example\u003c/p\u003e\u003c/div\u003e"
                      }
                  },
                  "search": {
                      "mode": "include"
                  }
              }
          ]
      };

  // add the example of a Library
  playground.examples["Library"] = {
    "@context": {
      "dc11": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#",
      "xsd": "http://www.w3.org/2001/XMLSchema#",
      "ex:contains": {"@type": "@id"}
    },
    "@graph": [{
      "@id": "http://example.org/library",
      "@type": "ex:Library",
      "ex:contains": "http://example.org/library/the-republic"
    }, {
      "@id": "http://example.org/library/the-republic",
      "@type": "ex:Book",
      "dc11:creator": "Plato",
      "dc11:title": "The Republic",
      "ex:contains": "http://example.org/library/the-republic#introduction"
    }, {
      "@id": "http://example.org/library/the-republic#introduction",
      "@type": "ex:Chapter",
      "dc11:description": "An introductory chapter on The Republic.",
      "dc11:title": "The Introduction"
    }]
  };

  // add the frame example of a Library
  playground.frames["Library"] = {
    "@context": {
      "dc11": "http://purl.org/dc/elements/1.1/",
      "ex": "http://example.org/vocab#"
    },
    "@type": "ex:Library",
    "ex:contains": {
      "@type": "ex:Book",
      "ex:contains": {"@type": "ex:Chapter"}
    }
  };

  // add an Activity Streams 2.0 Example
  // currently uses the temporary dev location for the context document.
  playground.examples["Activity"] = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "@type": "Create",
    "actor": {
      "@type": "Person",
      "@id": "acct:sally@example.org",
      "name": "Sally"
    },
    "object": {
      "@type": "Note",
      "content": "This is a simple note"
    },
    "published": "2015-01-25T12:34:56Z"
  }

})(jQuery);
