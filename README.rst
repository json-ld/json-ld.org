Introduction
------------


JSON-LD (JavaScript Object Notation for Linked Data) is a lightweight Linked
Data format. It is easy for humans to read and write. It is easy for machines
to parse and generate. It is based on the already successful JSON format and
provides a way to help JSON data interoperate at Web-scale. If you are already
familiar with JSON, writing JSON-LD is very easy. There is a smooth migration
path from the JSON you use today, to the JSON-LD you will use in the future.
These properties make JSON-LD an ideal Linked Data interchange language for
JavaScript environments, Web services, and unstructured databases such as
CouchDB and MongoDB.

A Simple Example
----------------

A simple example of a JSON object with added semantics::

  {
    "#": {"foaf": "http://xmlns.com/foaf/0.1/"},
    "@": "<http://example.org/people#john>",
    "a": "foaf:Person",
    "foaf:name" : "John Lennon"
  }

The example above describes a person whose name is John Lennon. The difference
between regular JSON and JSON-LD is that the JSON-LD object above uniquely
identifies itself on the Web and can be used, without introducing ambiguity,
across every Web site, Web services and databases in operation today.

The Specification
-----------------

If you are a developer, you may be interested in the latest WebID specification:

http://json-ld.org/spec/latest/

A list of all previous specification drafts is also available.

http://json-ld.org/spec/

