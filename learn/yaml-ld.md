---
layout: default
title: YAML-LD
---

    <div class="hero-unit">
      <h1>YAML-LD</h1>
      <br>
      <p class="tagline">YAML for Linked Data</p>
    </div>

<div class="container">
  <div class="row">
    <div class="span3">
      <h2><span class="icon-pencil"> </span>YAML</h2>
      <p class="text-justify">
        <a href="https://yaml.org">YAML</a>
        (Yet Another Markup Language) is a language designed for
        minimalistic and concise data representation. It is widely used for
        configuration files and metadata, and is optimized to be written
        and read by humans. Hence its lack of braces and support of comments.
      </p>
    </div>
    <!-- End span -->

    <div class="span6">
      <h2 style="text-align: center;">A Simple Example</h2>
      <pre>
<span style="color: rgb(255, 122, 0);">"@context"</span>: <a href="https://json-ld.org/contexts/person.jsonld">https://json-ld.org/contexts/person.jsonld</a>
<span style="color: rgb(255, 122, 0);">"@id"</span>: <a href="http://dbpedia.org/resource/John_Lennon">http://dbpedia.org/resource/John_Lennon</a>
<span style="color: rgb(255, 122, 0);">name</span>: <span style="color: rgb(0, 148, 0);">John Lennon</span>
<span style="color: rgb(255, 122, 0);">born</span>: <span style="color: rgb(0, 0, 175);">1940-10-09</span>
<span style="color: rgb(255, 122, 0);">spouse</span>: <a href="http://dbpedia.org/resource/Cynthia_Lennon">http://dbpedia.org/resource/Cynthia_Lennon</a></pre>
    </div>
    <!-- End span -->

    <div class="span3">
      <h2>
        <span>YAML-LD
      </h2>
      <p class="text-justify">
        YAML-LD relies upon APIs and algorithms of JSON-LD, but applies them
        to YAML instead of JSON. Since YAML is a superset of JSON, and JSON-LD
        is a subset of JSON, this, in most aspects, is straightforward.
      </p>
    </div>
    <!-- End span -->
  </div>
</div>

<div class="hero-unit">
  <h2 style="text-align:center;"><span class="icon-book icon-large"></span> Specification</h2>
  <div class="container">
    <div class="row">
      <p class="text-justify offset2 span8">
        The <strong>Specification</strong> is at Candidate stage right now. This is a formal document
        that describes how YAML-LD maps to JSON-LD and what's different between the two.
      </p>
      <a class="btn" href="https://json-ld.github.io/yaml-ld/">
        Open YAML-LD Candidate Spec
      </a>
    </div>
  </div>
  <!-- End span -->
</div>

<div class="container">
  <div id="developers" class="row">
    <h1 class="span12" style="text-align: center;"> <span class="icon-cog"></span> Developers</h1>
  </div>
  <div id="developers-description" class="row">
    <p class="offset2 span8" style="text-align: center;">YAML-LD is available in
      a number of popular programming environments. Each implementation of YAML-LD
      listed below is fully conforming to the official YAML-LD specifications.
    </p>
  </div>

  <div class="row">
    <!--div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Javascript</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/digitalbazaar/jsonld.js">
              <span property="schema:name">jsonld.js</span>
            </a>
          </li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/rubensworks/jsonld-streaming-parser.js">
              <span property="schema:name">jsonld-streaming-parser.js</span>
              <span class="badge badge-success">1.1</span>
            </a>
          </li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/rubensworks/jsonld-streaming-serializer.js">
              <span property="schema:name">jsonld-streaming-serializer.js</span>
              <span class="badge badge-success">1.1</span>
            </a>
          </li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/rubensworks/rdf-parse.js">
              <span property="schema:name">rdf-parse.js</span>
              <span class="badge badge-success">1.1</span>
            </a>
          </li>
        </ul>
      </div>
    </div-->

    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Python</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/iolanta-tech/python-yaml-ld">
              <span property="schema:name">python-yaml-ld</span>
              <span class="badge">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
            <span property="schema:programmingLanguage" content="Python"></span>
          </li>
          <!--li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/digitalbazaar/pyld">
              <span property="schema:name">PyLD</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Python"></span>
          </li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/niklasl/trld">
              <span property="schema:name">TRLD</span>
              <span class="badge">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
            <span property="schema:programmingLanguage" content="Python"></span>
          </li-->
        </ul>
      </div>
    </div>

    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Ruby</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/ruby-rdf/yaml-ld/">
              <span property="schema:name">YAML-LD for RDF.rb</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Ruby"></span>
          </li>
        </ul>
      </div>
    </div>

    <!--div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Go</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/piprate/json-gold">
              <span property="schema:name">JSON-goLD</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Go"></span>
          </li>
        </ul>
      </div>
    </div>
  </div-->

  <!-- div class="row">
    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Java</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/filip26/titanium-json-ld">
              <span property="schema:name">Titanium</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Java"></span>
          </li>
        </ul>
      </div>
    </div>

    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>C#</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/dotnetrdf/dotnetrdf">
              <span property="schema:name">dotNetRDF</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="C#"></span>
          </li>
        </ul>
      </div>
    </div>

    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Command Line</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/digitalbazaar/jsonld-cli">
              <span property="schema:name">jsonld-cli</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="JavaScript"></span>
          </li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/filip26/ld-cli">
              <span property="schema:name">ld-cli (Ubuntu, MacOS, Windows)</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Java"></span>
          </li>
        </ul>
      </div>
    </div>

    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Erlang / Elixir</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/rdf-elixir/jsonld-ex">
              <span property="schema:name">JSON-LD.ex</span>
              <span class="badge badge-success">1.1</span>
            </a>
            <span property="schema:programmingLanguage" content="Erlang"></span>
            <span property="schema:programmingLanguage" content="Elixir"></span>
          </li>
        </ul>
      </div>
    </div>
  </div-->

  <div class="row">
    <!-- Work in Progress implemenations -->
    <div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Rust</h3></li>
          <!--li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/timothee-haudebourg/json-ld">
              <span property="schema:name">json-ld</span>
              <span class="badge">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
            <span property="schema:programmingLanguage" content="Rust"></span>
          </li-->
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://crates.io/crates/sophia">
              <span property="schema:name">sophia</span>
              <span class="badge">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
            <span property="schema:programmingLanguage" content="Rust"></span>
            <ul>
              Powering the <a href="https://perso.liris.cnrs.fr/pierre-antoine.champin/2023/sowasm/">
                Interactive Playground with YAML-LD support
                <span class="badge badge-success">1.1</span>
              </a>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!--div class="span3">
      <div class="well" style="padding: 8px 0;">
        <ul class="nav nav-list">
          <li class="nav-header"><h3>Typescript</h3></li>
          <li typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/mattrglobal/jsonld-lint">
              <span property="schema:name">jsonld-lint</span>
              <span class="badge">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
            <span property="schema:programmingLanguage" content="Typescript"></span>
          </li>
        </ul>
      </div>
    </div-->
  </div>

  <div id="tests-description" class="row">
    <p class="offset2 span8" style="text-align: center;">
      Each YAML-LD document can be easily converted into a JSON-LD document; subsequently, the <a href="https://w3c.github.io/json-ld-api/tests/">JSON-LD Test Suite</a> (and <a href="https://w3c.github.io/json-ld-framing/tests/">Framing Test Suite</a>) is useful for validating YAML-LD Processors.
    </p>
    <p class="offset2 span8" style="text-align: center;">
      In addition, YAML-LD Specification defines the <a href="https://json-ld.github.io/yaml-ld/tests/">YAML-LD test suite</a> which tests features
      specific to YAML-LD.
    </p>
    <!--p class="offset3 span6" style="text-align: center;">
      Conformance of various processors is documented in the official <a href="https://w3c.github.io/json-ld-api/reports/">implementation report</a>.
    </p-->
  </div>
  <hr>
</div>
