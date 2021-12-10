# Notes about FHIR RDF mapping

## What does the extension `structuredefinition-fhir-type` mean?

| path/id			    | type code | ext uri		| shex shape | new type |
| Element.id			| String	| string		| string	 | xsd:string |
| Extension.url			| String	| uri			| uri   	 | 
| xhtml.value			| String	| string        |       	 | 
|                       |           |               |       	 | 
| base64Binary.value	| String	| base64Binary  | *     	 | 
| canonical.value		| String	| canonical     | string	 | 
| code.value			| String	| code          | string	 | 
| id.value				| String	| id            |       	 | 
| markdown.value		| String	| markdown      | string	 | 
| oid.value				| String	| oid           | string	 | 
| uri.value				| String	| uri           | *     	 | 
| url.value				| String	| url           | string	 | 
| uuid.value			| String	| uuid          | string	 | 
|                       |           |               |       	 | 
| instant.value			| DateTime	| instant       | *     	 | 
| integer64.value		| Integer	| integer64     | *     	 | 
| positiveInt.value		| Integer	| positiveInt   | string	 | 
| unsignedInt.value		| Integer	| unsignedInt   | string	 | 
|                       |           |               |       	 | 
| boolean.value			| Boolean	| boolean       | *     	 | 
| date.value			| Date		| date          | *     	 | 
| dateTime.value		| DateTime	| dateTime      | *     	 | 
| decimal.value			| Decimal	| decimal       | *     	 | 
| integer.value			| Integer	| integer       | *     	 | 
| string.value			| String	| string        | *     	 | 
| time.value			| Time		| time			| *			 | 


[MedicationRequest.shex](https://build.fhir.org/medicationrequest.shex.html) includes:

``` json
    {
      "type": "Shape",
      "id": "http://hl7.org/fhir/shape/id",
      "closed": true,
      "expression": {
        "type": "EachOf",
        "expressions": [
          {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/Element.id",
            "valueExpr": "http://hl7.org/fhir/shape/string",
            "min": 0, "max": 1
          },
          {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/Element.extension",
            "valueExpr": "http://hl7.org/fhir/shape/Extension",
            "min": 0, "max": -1
          },
          {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/value",
            "valueExpr": "http://hl7.org/fhir/shape/string",
            "min": 0, "max": 1
          },
          {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/index",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#integer" },
            "min": 0, "max": 1
          }
        ]
      }
    }
```

which is supposed to validate [Order for a medication that includes the dosage of a prescription in text](https://build.fhir.org/medicationrequestexample2.ttl.html):
``` turtle
<http://hl7.org/fhir/MedicationRequest/medrx002> a fhir:MedicationRequest;
  fhir:nodeRole fhir:treeRoot;
  fhir:Resource.id [ fhir:value "medrx002"];
```

This works by luck (but should not) because `http://hl7.org/fhir/shape/string` is not falsifiable (all 0 min cardinalities). The ShEx should instead be something like:
```
          {
            "type": "TripleConstraint",
            "predicate": "http://hl7.org/fhir/value",
            "valueExpr": { "type": "NodeConstraint", "datatype": "http://www.w3.org/2001/XMLSchema#string" },
            "min": 1, "max": 1
          },
```

This is created from MedicationRequest:
```
    {
      "fullUrl": "http://hl7.org/fhir/StructureDefinition/MedicationRequest",
      "resource": {
        "resourceType": "StructureDefinition",
        "id": "MedicationRequest",
        "baseDefinition": "http://hl7.org/fhir/StructureDefinition/DomainResource",
```

extending DomainResource:
```
    {
      "fullUrl": "http://hl7.org/fhir/StructureDefinition/DomainResource",
      "resource": {
        "resourceType": "StructureDefinition",
        "id": "DomainResource", 
        "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Resource", 
```

extending Resource, with a `structuredefinition-fhir-type` uri of `id`:
```
    {
      "fullUrl": "http://hl7.org/fhir/StructureDefinition/Resource",
      "resource": {
        "resourceType": "StructureDefinition",
        "id": "Resource",
        "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Base",
        "derivation": "specialization",
        "differential": {
          "element": [
            {
              "id": "Resource.id",
              "min": 0, "max": "1",
              "type": [
                {
                  "extension": [
                    { "url": "http://hl7.org/fhir/StructureDefinition/structuredefinition-fhir-type", "valueUri": "id" }
                  ],
                  "code": "http://hl7.org/fhirpath/System.String"
                }
              ]
            }
          ]
        }
      }
    },
```

## What alternatives are there to:?

```
        "derivation": "specialization",
```
