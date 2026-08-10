---
layout: fomantic
title: YAML-LD
masthead:
  title: YAML-LD
  subtitle: YAML for Linked Data
---

<div class="ui stackable grid">
  <div class="justified five wide column">
    <h2><i class="pencil alternate icon"></i> YAML</h2>
    <p>
      <a href="https://yaml.org">YAML</a> (YAML Ain't Markup Language) is
      designed for minimalistic and concise data representation. It is widely
      used for configuration files and metadata, and is optimized to be written
      and read by humans, hence its lack of braces and its support for comments.
      It is defined by the
      <a href="https://yaml.org/spec/1.2.2/">YAML 1.2.2 specification</a>.
    </p>
  </div>
  <div class="six wide column">
    <div class="ui segment">
      <pre style="margin: 0 !important;"><span style="color: rgb(255, 122, 0);">"@context"</span>: <a href="https://json-ld.org/contexts/person.jsonld">https://json-ld.org/contexts/person.jsonld</a>
<span style="color: rgb(255, 122, 0);">"@id"</span>: <a href="http://dbpedia.org/resource/John_Lennon">http://dbpedia.org/resource/John_Lennon</a>
<span style="color: rgb(255, 122, 0);">name</span>: <span style="color: rgb(0, 148, 0);">John Lennon</span>
<span style="color: rgb(255, 122, 0);">born</span>: <span style="color: rgb(0, 0, 175);">1940-10-09</span>
<span style="color: rgb(255, 122, 0);">spouse</span>:
  - <a href="http://dbpedia.org/resource/Yoko_Ono">http://dbpedia.org/resource/Yoko_Ono</a>
  - <a href="http://dbpedia.org/resource/Cynthia_Lennon">http://dbpedia.org/resource/Cynthia_Lennon</a></pre>
    </div>
  </div>
  <div class="justified five wide column">
    <h2><i class="exchange alternate icon"></i> YAML-LD</h2>
    <p>
      YAML-LD relies upon the APIs and algorithms of JSON-LD, but applies them
      to YAML instead of JSON. Since YAML is a superset of JSON, and JSON-LD is
      a subset of JSON, this is, in most aspects, straightforward.
    </p>
  </div>
</div>

<div class="ui large center aligned segment" style="margin: 3em auto">
  <div class="ui center aligned massive basic segment grid">
    <div class="ui header">
      <i class="book icon"></i>
      <span class="content">Specification</span>
    </div>
  </div>
  <p class="ui basic huge left aligned padded segment">
    The <strong>YAML-LD specification</strong> is a formal document that
    describes how YAML-LD maps to JSON-LD and where the two differ. It is
    developed by the W3C JSON-LD Working Group and is at Candidate
    Recommendation stage.
  </p>
  <a href="https://w3c.github.io/yaml-ld/" class="ui primary big button">Read the YAML-LD Specification</a>
</div>

<div class="ui center aligned massive basic segment grid" id="developers">
  <div class="ui header">
    <i class="cog icon"></i>
    <span class="content">Developers</span>
  </div>
</div>

<p class="ui basic large center aligned segment">
  YAML-LD is available in a growing number of programming environments. Each
  document can be converted to JSON-LD, so JSON-LD tooling and test suites apply
  directly.
</p>

<div class="ui three stackable cards">
  <div class="card">
    <div class="content">
      <div class="header"><h3>Python</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://python-yaml-ld.iolanta.tech/">
              <span property="schema:name">python-yaml-ld</span>
              <span class="ui label">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="content">
      <div class="header"><h3>Ruby</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/ruby-rdf/yaml-ld">
              <span property="schema:name">YAML-LD for RDF.rb</span>
              <span class="ui green label">1.1</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="content">
      <div class="header"><h3>Rust</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://crates.io/crates/sophia">
              <span property="schema:name">sophia</span>
              <span class="ui label">1.1 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
          </div>
          <div class="item">
            <a href="https://perso.liris.cnrs.fr/pierre-antoine.champin/2023/sowasm/">
              Interactive Playground with YAML-LD support
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="ui center aligned massive basic segment grid" id="convenience-contexts" style="margin-top: 3em">
  <div class="ui header">
    <i class="magic icon"></i>
    <span class="content">Convenience Contexts</span>
  </div>
</div>

<p class="ui basic large center aligned segment">
  In YAML, the <code>@</code> character is reserved, so JSON-LD keywords such as
  <code>@id</code> and <code>@type</code> must be quoted. To keep documents
  unquoted and readable, json-ld.org publishes two convenience contexts that
  alias the keywords away. Add one to your <code>"@context"</code> and rewrite
  the example above. The <code>@context</code> keyword itself cannot be aliased,
  so it stays quoted.
</p>

<div class="ui stackable two column grid">
  <div class="column">
    <h3 class="ui header">
      <a href="https://json-ld.org/contexts/convenience.jsonld">convenience.jsonld</a>
    </h3>
    <p>Removes the <code>@</code>, mapping <code>@id</code> to <code>id</code>, <code>@type</code> to <code>type</code>, and so on.</p>
    <div class="ui segment">
      <pre style="margin: 0 !important;"><span style="color: rgb(255, 122, 0);">"@context"</span>:
  - <a href="https://json-ld.org/contexts/person.jsonld">https://json-ld.org/contexts/person.jsonld</a>
  - <a href="https://json-ld.org/contexts/convenience.jsonld">https://json-ld.org/contexts/convenience.jsonld</a>
<span style="color: rgb(255, 122, 0);">id</span>: <a href="http://dbpedia.org/resource/John_Lennon">http://dbpedia.org/resource/John_Lennon</a>
<span style="color: rgb(255, 122, 0);">name</span>: <span style="color: rgb(0, 148, 0);">John Lennon</span>
<span style="color: rgb(150, 150, 150);"># …</span></pre>
    </div>
  </div>
  <div class="column">
    <h3 class="ui header">
      <a href="https://json-ld.org/contexts/dollar-convenience.jsonld">dollar-convenience.jsonld</a>
    </h3>
    <p>Replaces the <code>@</code> with <code>$</code>, mapping <code>@id</code> to <code>$id</code>, <code>@type</code> to <code>$type</code>, and so on.</p>
    <div class="ui segment">
      <pre style="margin: 0 !important;"><span style="color: rgb(255, 122, 0);">"@context"</span>:
  - <a href="https://json-ld.org/contexts/person.jsonld">https://json-ld.org/contexts/person.jsonld</a>
  - <a href="https://json-ld.org/contexts/dollar-convenience.jsonld">https://json-ld.org/contexts/dollar-convenience.jsonld</a>
<span style="color: rgb(255, 122, 0);">$id</span>: <a href="http://dbpedia.org/resource/John_Lennon">http://dbpedia.org/resource/John_Lennon</a>
<span style="color: rgb(255, 122, 0);">name</span>: <span style="color: rgb(0, 148, 0);">John Lennon</span>
<span style="color: rgb(150, 150, 150);"># …</span></pre>
    </div>
  </div>
</div>
