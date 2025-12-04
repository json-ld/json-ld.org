---
layout: fomantic
title: Specifications
ga: 40462488
---

# Specifications

JSON-LD has been designed to be a modular set of specifications. It
consists of two base specifications: The JSON-LD Syntax and the JSON-LD
API. All other JSON-LD specifications are layered upon the previous two
specifications, allowing the community to build experimental extensions
on top of the base specifications.

## [The JSON-LD Syntax](latest/json-ld/) {#syntax}

Defines JSON-LD, a JSON-based format to serialize Linked Data. The
syntax is designed to easily integrate into deployed systems that
already use JSON, and provides a smooth upgrade path from JSON to
JSON-LD. It is primarily intended to be a way to use Linked Data in
Web-based programming environments, to build interoperable Web services,
and to store Linked Data in JSON-based storage engines.

Links to JSON-LD specifications: [Latest](latest/json-ld/)
{%- for draft in specs['json-ld'] -%}, [{{ draft[0]}}]({{ draft[1] }}) {%- endfor %}
{%- for draft in specs['json-ld-syntax'] -%}, [{{ draft[0] }}]({{ draft[1] }}) {%- endfor %}


## [The JSON-LD API](latest/json-ld-api/) {#api}

An Application Programming Interface (API) and a set of algorithms for
programmatic transformations of JSON-LD documents. This API defines
algorithms for applying and removing JSON-LD contexts.

Links to JSON-LD API specifications: [Latest](latest/json-ld-api/)
{%- for draft in specs['json-ld-api'] -%}, [{{ draft[0]}}]({{ draft[1] }}) {%- endfor %}


## [JSON-LD Best Practices](https://w3c.github.io/json-ld-bp) {#best-practices}

Best practices for publishing JSON-LD and building APIs.

Links to JSON-LD API specifications:
[Latest](https://w3c.github.io/json-ld-bp)
{%- for draft in specs['json-ld-api-best-practices'] -%} , [{{ draft[0]}}({{ draft[1] }}) {%- endfor %}



## [JSON-LD Framing](latest/json-ld-framing/) {#framing}

JSON-LD Framing allows developers to perform *query by example* and
force a specific tree layout to a JSON-LD document. It allows developers
to restructure data retrieved from the Web according to the specific
needs of their application. Restructuring JSON-LD data before your
application processes it leads to simpler code when processing data from
external sources.

Links to JSON-LD Framing specifications:
[Latest](latest/json-ld-framing/)
{%- for draft in specs['json-ld-framing'] -%} , [{{ draft[0] }}]({{ draft[1] }}) {%- endfor %}



## [JSON-LD RDF API](latest/json-ld-rdf/)

JSON-LD RDF API describes access methods for transforming and abstract
RDF represention into JSON-LD and back.

Links to JSON-LD RDF API specifications:
[Latest](latest/json-ld-rdf/)
{%- for draft in specs['json-ld-rdf'] -%} , [{{ draft[0] }}]({{ draft[1] }}) {%- endfor %}


<div id="footer" class="ui message">

JSON-LD Specifications are covered by the [W3C DOCUMENT
LICENSE](https://www.w3.org/Consortium/Legal/2015/doc-license) except
where an alternate is specified.

</div>
