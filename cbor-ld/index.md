---
layout: fomantic
title: CBOR-LD
masthead:
  title: CBOR-LD
  subtitle: CBOR for Linked Data
---

<div class="ui stackable grid">
  <div class="justified five wide column">
    <h2><i class="microchip icon"></i> CBOR</h2>
    <p>
      <a href="https://cbor.io">CBOR</a> (Concise Binary Object Representation)
      is a binary data format designed for small message sizes and minimal
      code footprint. Its data model is a superset of JSON, which makes it a
      natural target for a compact, machine-oriented representation of Linked
      Data. It is standardized by
      <a href="https://www.rfc-editor.org/rfc/rfc8949">RFC 8949</a> (STD 94),
      which obsoletes the earlier
      <a href="https://www.rfc-editor.org/rfc/rfc7049">RFC 7049</a>.
    </p>
  </div>
  <div class="six wide column">
    <div class="ui segment">
      <h3 class="ui header">From JSON-LD to CBOR-LD</h3>
      <p>
        CBOR-LD compresses a JSON-LD document by replacing terms and common
        values defined in its <code>@context</code> with compact numeric
        identifiers, then encoding the result as CBOR. The process is fully
        reversible: a CBOR-LD payload decodes back into the original JSON-LD
        document.
      </p>
    </div>
  </div>
  <div class="justified five wide column">
    <h2><i class="exchange alternate icon"></i> CBOR-LD</h2>
    <p>
      CBOR-LD is a tightly-compressed binary representation of Linked Data for
      space-constrained applications such as QR codes, PDF417 barcodes, and NFC
      tags, as well as streaming and embedded-environment use cases.
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
    The <strong>CBOR-LD specification</strong> describes how JSON-LD documents
    are compressed into and decompressed from the CBOR-LD binary format. It is
    developed by the W3C JSON-LD Working Group.
  </p>
  <a href="https://w3c.github.io/cbor-ld/" class="ui primary big button">Read the CBOR-LD Specification</a>
</div>

<div class="ui center aligned massive basic segment grid" id="developers">
  <div class="ui header">
    <i class="cog icon"></i>
    <span class="content">Developers</span>
  </div>
</div>

<p class="ui basic large center aligned segment">
  CBOR-LD is available in a growing number of programming environments.
</p>

<div class="ui four stackable cards">
  <div class="card">
    <div class="content">
      <div class="header"><h3>JavaScript</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/digitalbazaar/cborld">
              <span property="schema:name">cborld</span>
              <span class="ui green label">8.1.0</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="content">
      <div class="header"><h3>Java</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://github.com/filip26/iridium-cbor-ld">
              <span property="schema:name">iridium-cbor-ld</span>
              <span class="ui green label">0.3.0</span>
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
            <a property="schema:codeRepository" href="https://github.com/spruceid/cbor-ld">
              <span property="schema:name">cbor-ld</span>
              <span class="ui label">0.2.0 (<abbr title="Work In Progress">WIP</abbr>)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="content">
      <div class="header"><h3>C</h3></div>
      <div class="description">
        <div class="ui selection list">
          <div class="item" typeof="schema:SoftwareSourceCode">
            <a property="schema:codeRepository" href="https://gitlab.com/coswot/cborld-c">
              <span property="schema:name">cborld-c</span>
              <span class="ui label"><abbr title="Work In Progress">WIP</abbr></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
