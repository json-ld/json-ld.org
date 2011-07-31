Introduction
------------

JSON-LD (JavaScript Object Notation for Linking Data) is a lightweight Linked
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

A simple example of a JSON object with added semantics:

::
 { 
   "@context": "http://purl.org/jsonld/Person",
   "@subject": "http://dbpedia.org/resource/John_Lennon",
   "name": "John Lennon",
   "birthday": "10-09",
   "member": "http://dbpedia.org/resource/The_Beatles"
 }

The example above describes a person whose name is John Lennon. The difference
between regular JSON and JSON-LD is that the JSON-LD object above uniquely
identifies itself on the Web and can be used, without introducing ambiguity,
across every Web site, Web services and databases in operation today.

The Playground
--------------

If you would like to play around with JSON-LD markup, you may do so here:

http://json-ld.org/playground/

The Specification
-----------------

If you are a developer, you may be interested in the latest WebID specification:

http://json-ld.org/spec/latest/

A list of all previous specification drafts is also available.

http://json-ld.org/spec/

