# Notes about FHIR RDF mapping

## What does the extension `structuredefinition-fhir-type` mean?

| path/id            | type code | ext uri      | old shape | new type                                      |
|--------------------|-----------|--------------|-----------|-----------------------------------------------|
| Element.id         | String    | string       | string    | xs:string                                     |
| Extension.url      | String    | uri          | uri       | xs:anyUri                                     |
| xhtml.value        | String    | string       |           | N/A                                           |
|--------------------|-----------|--------------|-----------|-----------------------------------------------|
|                    |           |              |           |                                               |
| base64Binary.value | String    | base64Binary | *         | xs:string                                     |
| canonical.value    | String    | canonical    | string    | xs:anyURI                                     |
| code.value         | String    | code         | string    | xs:token                                      |
| id.value           | String    | id           |           | xs:string                                     |
| markdown.value     | String    | markdown     | string    | xs:string                                     |
| oid.value          | String    | oid          | string    | xs:anyURI                                     |
| uri.value          | String    | uri          | *         | xs:anyURI                                     |
| url.value          | String    | url          | string    | xs:anyURI                                     |
| uuid.value         | String    | uuid         | string    | xs:anyURI                                     |
|--------------------|-----------|--------------|-----------|-----------------------------------------------|
|                    |           |              |           |                                               |
| instant.value      | DateTime  | instant      | *         | xs:dateTime                                   |
| integer64.value    | Integer   | integer64    | *         | xs:long                                       |
| positiveInt.value  | Integer   | positiveInt  | string    | xs:positiveInteger                            |
| unsignedInt.value  | Integer   | unsignedInt  | string    | xs:nonNegativeInteger                         |
|--------------------|-----------|--------------|-----------|-----------------------------------------------|
|                    |           |              |           |                                               |
| boolean.value      | Boolean   | boolean      | *         | xs:boolean                                    |
| date.value         | Date      | date         | *         | xs:date, xs:gYearMonth, xs:gYear              |
| dateTime.value     | DateTime  | dateTime     | *         | xs:dateTime, xs:date, xs:gYearMonth, xs:gYear |
| decimal.value      | Decimal   | decimal      | *         | xs:decimal, xs:double                         |
| integer.value      | Integer   | integer      | *         | xs:int                                        |
| string.value       | String    | string       | *         | xs:string                                     |
| time.value         | Time      | time         | *         | xs:time                                       |

types according to [Datatypes - Primitive types](http://build.fhir.org/datatypes.html#primitive):
```
{
  "boolean": { "XMLRepresentation": "xs:boolean", "caveats": "0 and 1 are not valid values" },
  "integer": { "XMLRepresentation": "xs:int", "caveats": "leading 0 digits are not allowed" },
  "integer64": { "XMLRepresentation": "xs:long", "caveats": "leading 0 digits are not allowed" },
  "string": { "XMLRepresentation": "xs:string" },
  "decimal": { "XMLRepresentation": ["xs:decimal", "xs:double"] },
  "uri": { "XMLRepresentation": "xs:anyURI" },
  "url": { "XMLRepresentation": "xs:anyURI" },
  "canonical": { "XMLRepresentation": "xs:anyURI" },
  "base64Binary": { "XMLRepresentation": "xs:base64Binary" },
  "instant": { "XMLRepresentation": "xs:dateTime" },
  "date": { "XMLRepresentation": ["xs:date", "xs:gYearMonth", "xs:gYear"] },
  "dateTime": { "XMLRepresentation": ["xs:dateTime", "xs:date", "xs:gYearMonth", "xs:gYear"] },
  "time": { "XMLRepresentation": "xs:time" },
  "code": { "XMLRepresentation": "xs:token" },
  "oid": { "XMLRepresentation": "xs:anyURI" },
  "id": { "XMLRepresentation": "xs:string" },
  "markdown": { "XMLRepresentation": "xs:string" },
  "unsignedInt": { "XMLRepresentation": "xs:nonNegativeInteger" },
  "positiveInt": { "XMLRepresentation": "xs:positiveInteger" },
  "uuid": { "XMLRepresentation": "xs:anyURI" }
}
```


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
