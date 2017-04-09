/**
 * An implementation of the Linked Data Signatures specification for JSON-LD.
 * This library works in the browser and node.js.
 *
 * @author Dave Longley <dlongley@digitalbazaar.com>
 * @author David I. Lehn <dlehn@digitalbazaar.com>
 * @author Manu Sporny <msporny@digitalbazaar.com>
 *
 * BSD 3-Clause License
 * Copyright (c) 2014-2016 Digital Bazaar, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *.now
 * Neither the name of the Digital Bazaar, Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
(function(global) {

'use strict';

// determine if using node.js or browser
var _nodejs = (
  typeof process !== 'undefined' && process.versions && process.versions.node);
var _browser = !_nodejs &&
  (typeof window !== 'undefined' || typeof self !== 'undefined');

/**
 * Attaches the JSON-LD Signatures API to the given object.
 *
 * @param api the object to attach the signatures API to.
 * @param [options] the options to use:
 *          [inject] *deprecated*, use `use` API instead; the dependencies to
 *              inject, available global defaults will be used otherwise.
 *            [async] async API.
 *            [forge] forge API.
 *            [jsonld] jsonld.js API; all remote documents will be loaded
 *              using jsonld.documentLoader by default, so ensure a secure
 *              document loader is configured.
 */
function wrap(api, options) {

options = options || {};
var libs = {};

/* API Constants */

api.SECURITY_CONTEXT_URL = 'https://w3id.org/security/v1';
api.SUPPORTED_ALGORITHMS = [
  'EcdsaKoblitzSignature2016',
  'GraphSignature2012',
  'LinkedDataSignature2015'
];

/* Core API */

/**
 * Allows injectables to be set or retrieved.
 *
 * @param name the name of the injectable to use (
 *          eg: `jsonld`, `jsonld-signatures`).
 * @param [injectable] the api to set for the injectable, only present for setter,
 *          omit for getter.
 *
 * @return the API for `name` if not using this method as a setter, otherwise
 *   undefined.
 */
api.use = function(name, injectable) {
  // setter mode
  if(injectable) {
    libs[name] = injectable;
    return;
  }

  // getter mode:

  // api not set yet, load default
  if(!libs[name]) {
    var requireAliases = {
      'forge': 'node-forge',
      'bitcoreMessage': 'bitcore-message'
    };
    var requireName = requireAliases[name] || name;
    var globalName = (name === 'jsonld' ? 'jsonldjs' : name);
    libs[name] = global[globalName] || (_nodejs && require(requireName));
    if(name === 'jsonld') {
      if(_nodejs) {
        // locally configure jsonld
        libs[name] = libs[name]();
        libs[name].useDocumentLoader('node', {secure: true, strictSSL: true});
      }
    }
  }
  return libs[name];
};

/**
 * Signs a JSON-LD document using a digital signature.
 *
 * @param input the JSON-LD document to be signed.
 * @param [options] options to use:
 *          privateKeyPem A PEM-encoded private key.
 *          creator the URL to the paired public key.
 *          [date] an optional date to override the signature date with.
 *          [domain] an optional domain to include in the signature.
 *          [nonce] an optional nonce to include in the signature.
 *          [algorithm] the algorithm to use, eg: 'GraphSignature2012',
 *            'LinkedDataSignature2015' (default: 'GraphSignature2012').
 * @param callback(err, signedDocument) called once the operation completes.
 */
api.sign = function(input, options, callback) {
  callback = callback || options;
  if(!callback) {
    options = {};
  }
  var privateKeyPem = options.privateKeyPem;
  var privateKeyWif = options.privateKeyWif;
  var creator = options.creator;
  var date = options.date || new Date();
  var domain = options.domain || null;
  var nonce = options.nonce || null;
  var algorithm = options.algorithm || 'GraphSignature2012';

  if(api.SUPPORTED_ALGORITHMS.indexOf(algorithm) === -1) {
    return callback(new Error(
      '[jsigs.sign] Unsupported algorithm "' + algorithm + '"; ' +
      'options.algorithm must be one of: ' +
      JSON.stringify(api.SUPPORTED_ALGORITHMS)));
  }

  if(algorithm === 'EcdsaKoblitzSignature2016') {
    if(typeof privateKeyWif !== 'string') {
      return callback(new TypeError(
        '[jsig.sign] options.privateKeyWif must be a base 58 formatted string.'));
    }
  } else if(typeof privateKeyPem !== 'string') {
    return callback(new TypeError(
      '[jsig.sign] options.privateKeyPem must be a PEM formatted string.'));
  }

  if(typeof creator !== 'string') {
    return callback(new TypeError(
      '[jsig.sign] options.creator must be a URL string.'));
  }
  if(domain && typeof domain !== 'string') {
    return callback(new TypeError(
      '[jsig.sign] options.domain must be a string.'));
  }
  if(nonce && typeof nonce !== 'string') {
    return callback(new TypeError(
      '[jsig.sign] options.nonce must be a string.'));
  }

  // create W3C-formatted date
  if(typeof date !== 'string') {
    date = _w3cDate(date);
  }

  var jsonld = api.use('jsonld');
  var async = api.use('async');
  async.auto({
    normalize: function(callback) {
      var normalizeAlgorithm;
      if(algorithm === 'GraphSignature2012') {
        normalizeAlgorithm = 'URGNA2012';
      } else {
        normalizeAlgorithm = 'URDNA2015';
      }
      jsonld.normalize(
        input, {algorithm: normalizeAlgorithm, format: 'application/nquads'},
        callback);
    },
    sign: ['normalize', function(callback, results) {
      var normalized = results.normalize;
      if(normalized.length === 0) {
        var inputJson = '';
        try {
          inputJson = JSON.stringify(input, null, 2);
        } catch(err) {
          inputJson = 'JSON stringification error: ' + err;
        }
        return callback(new Error('[jsig.sign] ' +
          'The data to sign is empty. This error may be because a ' +
          '"@context" was not supplied in the input thereby causing ' +
          'any terms or prefixes to be undefined. ' +
          'Input:\n' + inputJson));
      }

      _createSignature(normalized, {
        algorithm: algorithm,
        privateKeyPem: privateKeyPem,
        privateKeyWif: privateKeyWif,
        date: date,
        nonce: nonce,
        domain: domain
      }, callback);
    }],
    compact: ['sign', function(callback, results) {
      // create signature info
      var signature = {
        '@context': api.SECURITY_CONTEXT_URL,
        type: algorithm,
        creator: creator,
        created: date,
        signatureValue: results.sign
      };
      if(domain !== null) {
        signature.domain = domain;
      }
      if(nonce !== null) {
        signature.nonce = nonce;
      }
      var tmp = {
        'https://w3id.org/security#signature': signature
      };
      var ctx = jsonld.getValues(input, '@context');
      jsonld.compact(tmp, ctx, function(err, compacted) {
        callback(err, compacted);
      });
    }],
    addSignature: ['compact', function(callback, results) {
      var output = _deepClone(input);
      delete results.compact['@context'];
      var signatureKey = Object.keys(results.compact)[0];
      // TODO: support multiple signatures
      output[signatureKey] = results.compact[signatureKey];
      callback(null, output);
    }]
  }, function(err, results) {
    callback(err, results.addSignature);
  });
};

/**
 * Verifies a JSON-LD digitally-signed object.
 *
 * @param obj the JSON-LD object to verify.
 * @param [options] the options to use:
 *          [publicKey] the JSON-LD document providing the public key info.
 *          [publicKeyOwner] the JSON-LD document providing the public key
 *            owner info including the list of valid keys for that owner.
 *          [checkNonce(nonce, options, function(err, valid))] a callback to
 *            check if the nonce (null if none) used in the signature is valid.
 *          [checkDomain(domain, options, function(err, valid))] a callback
 *            to check if the domain used (null if none) is valid.
 *          [checkKey(key, options, function(err, trusted))] a callback to
 *            check if the key used to sign the message is trusted.
 *          [checkKeyOwner(owner, key, options, function(err, trusted))] a
 *            callback to check if the key's owner is trusted.
 *          [checkTimestamp]: check signature timestamp (default: false).
 *          [maxTimestampDelta]: signature must be created within a window of
 *            this many seconds (default: 15 minutes).
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 *          [id] the ID (full URL) of the node to check the signature of, if
 *            the input contains multiple signed nodes.
 * @param callback(err, verified) called once the operation completes.
 */
api.verify = function(input, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  var jsonld = api.use('jsonld');

  // TODO: frame before getting signature, not just compact? considerations:
  // should the assumption be that the signature is on the top-level object
  // and thus framing is unnecessary?

  // compact to get signature and types
  jsonld.compact(input, api.SECURITY_CONTEXT_URL, function(err, compacted) {
    if(err) {
      return callback(err);
    }
    var signature = jsonld.getValues(compacted, 'signature')[0] || null;
    if(!signature) {
      return callback(new Error('[jsigs.verify] No signature found.'));
    }
    var algorithm = jsonld.getValues(signature, 'type')[0] || '';
    algorithm = algorithm.replace(/^.+:/, '');  // strip off any namespace to compare to known algorithm names
    if(api.SUPPORTED_ALGORITHMS.indexOf(algorithm) === -1) {
      return callback(new Error(
        '[jsigs.verify] Unsupported signature algorithm "' + algorithm + '"; ' +
        'supported algorithms are: ' +
        JSON.stringify(api.SUPPORTED_ALGORITHMS)));
    }
    return _verify(algorithm, input, options, callback);
  });
};

/* Helper functions */

/**
 * Gets a remote public key.
 *
 * @param id the ID for the public key.
 * @param [options] the options to use:
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 * @param callback(err, key) called once the operation completes.
 */
api.getPublicKey = function(id, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  api.getJsonLd(id, options, function(err, key) {
    if(err) {
      return callback(err);
    }

    // FIXME: improve validation
    if(!('publicKeyPem' in key)) {
      return callback(new Error('[jsigs.getPublicKey] ' +
        'Could not get public key. Unknown format.'));
    }

    callback(null, key);
  });
};

/**
 * Checks to see if the given key is trusted.
 *
 * @param key the public key to check.
 * @param [options] the options to use:
 *          [publicKeyOwner] the JSON-LD document describing the public key
 *            owner.
 *          [checkKeyOwner(owner, key)] a custom method to return whether
 *            or not the key owner is trusted.
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 * @param callback(err, trusted) called once the operation completes.
 */
api.checkKey = function(key, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  var jsonld = api.use('jsonld');
  var async = api.use('async');
  async.auto({
    getOwner: function(callback) {
      if(options.publicKeyOwner) {
        return callback(null, options.publicKeyOwner);
      }
      api.getJsonLd(key.owner, options, callback);
    },
    frameKey: function(callback) {
      var frame = {
        '@context': api.SECURITY_CONTEXT_URL,
        type: 'CryptographicKey'
      };
      jsonld.frame(key, frame, function(err, framed) {
        if(err) {
          return callback(err);
        }
        if(!framed['@graph'][0]) {
          return callback(new Error('[jsigs.verify] ' +
            'The public key is not a CryptographicKey.'));
        }
        callback(null, framed['@graph'][0]);
      });
    },
    frameOwner: ['getOwner', function(callback, results) {
      var frame = {
        '@context': api.SECURITY_CONTEXT_URL,
        publicKey: {'@embed': '@never'}
      };
      jsonld.frame(results.getOwner, frame, function(err, framed) {
        if(err) {
          return callback(err);
        }
        callback(null, framed['@graph']);
      });
    }],
    checkOwner: ['frameOwner', 'frameKey', function(callback, results) {
      // find specific owner of key
      var owner;
      var owners = results.frameOwner;
      var framedKey = results.frameKey;
      for(var i = 0; i < owners.length; ++i) {
        if(jsonld.hasValue(owners[i], 'publicKey', framedKey.id)) {
          owner = owners[i];
          break;
        }
      }
      if(!owner) {
        return callback(new Error('[jsigs.verify] ' +
          'The public key is not owned by its declared owner.'));
      }
      if(!options.checkKeyOwner) {
        return callback();
      }
      options.checkKeyOwner(owner, key, options, function(err, trusted) {
        if(err) {
          return callback(err);
        }
        if(!trusted) {
          return callback(new Error('[jsigs.verify] ' +
            'The owner of the public key is not trusted.'));
        }
        return callback();
      });
    }]
  }, function(err) {
    callback(err, !err && true);
  });
};

/**
 * Retrieves a JSON-LD object over HTTP. To implement caching, override
 * this method.
 *
 * @param url the URL to HTTP GET.
 * @param [options] the options to use.
 *          [documentLoader(url, callback(err, remoteDoc))] the document loader.
 * @param callback(err, result) called once the operation completes.
 */
api.getJsonLd = function(url, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  var jsonld = api.use('jsonld');

  var documentLoader = options.documentLoader || jsonld.documentLoader;
  documentLoader(url, function(err, result) {
    if(err) {
      return callback(err);
    }
    // ensure result is parsed
    if(typeof result.document === 'string') {
      try {
        result.document = JSON.parse(result.document);
      } catch(e) {
        return callback(e);
      }
    }
    if(!result.document) {
      return callback(new Error(
        '[jsigs.getJsonLd] No JSON-LD found at "' + url + '".'));
    }
    // compact w/context URL from link header
    if(result.contextUrl) {
      return jsonld.compact(
        result.document, result.contextUrl, {expandContext: result.contextUrl},
        callback);
    }
    callback(null, result.document);
  });
};

// handle dependency injection
(function() {
  var inject = options.inject || {};
  for(var name in inject) {
    api.use(name, inject[name]);
  }
})();

function _verify(algorithm, input, options, callback) {
  var checkTimestamp = (
    'checkTimestamp' in options ? options.checkTimestamp : false);
  var maxTimestampDelta = (
    'maxTimestampDelta' in options ? options.maxTimestampDelta : (15 * 60));
  var jsonld = api.use('jsonld');
  var async = api.use('async');
  async.auto({
    // FIXME: add support for multiple signatures
    //      : for many signers of an object, can just check all sigs
    //      : for signed sigs, need to recurse?
    frame: function(callback) {
      // frame message to retrieve signature
      // TODO: `frame` also needs to be run for other algorithms once
      // any named graph issues are sorted out with the framing algorithm
      if(algorithm === 'GraphSignature2012') {
        var frame = {
          '@context': api.SECURITY_CONTEXT_URL,
          signature: {
            type: algorithm,
            created: {},
            creator: {},
            signatureValue: {}
          }
        };
        if(options.id) {
          frame.id = options.id;
        }
        jsonld.frame(input, frame, function(err, framed) {
          if(err) {
            return callback(err);
          }
          var graphs = framed['@graph'];
          if(graphs.length === 0) {
            return callback(new Error('[jsigs.verify] ' +
              'No signed data found in the provided input.'));
          }
          if(graphs.length > 1) {
            return callback(new Error('[jsigs.verify] ' +
              'More than one signed graph found.'));
          }
          var graph = graphs[0];
          // copy the top level framed data context
          graph['@context'] = framed['@context'];
          var signature = graph.signature;
          if(!signature) {
            return callback(new Error('[jsigs.verify] ' +
              'The message is not digitally signed using a known algorithm.'));
          }
          callback(null, graph);
        });
      } else {
        // TODO: remove and use `frame` once named graph issues with framing
        // are sorted out
        jsonld.compact(input, api.SECURITY_CONTEXT_URL, function(err, framed) {
          if(err) {
            return callback(err);
          }
          var signatures = jsonld.getValues(framed, 'signature');
          if(signatures.length > 1) {
            return callback(new Error('[jsigs.verify] ' +
              'More than one signed graph found.'));
          }
          callback(null, framed);
        });
      }
    },
    checkNonce: ['frame', function(callback, results) {
      var signature = results.frame.signature;
      var cb = function(err, valid) {
        if(err) {
          return callback(err);
        }
        if(!valid) {
          return callback(new Error('[jsigs.verify] ' +
            'The message nonce is invalid.'));
        }
        callback();
      };
      if(!options.checkNonce) {
        return cb(
          null, (signature.nonce === null || signature.nonce === undefined));
      }
      options.checkNonce(signature.nonce, options, cb);
    }],
    checkDomain: ['frame', function(callback, results) {
      var signature = results.frame.signature;
      var cb = function(err, valid) {
        if(err) {
          return callback(err);
        }
        if(!valid) {
          return callback(new Error('[jsigs.verify] ' +
            'The message domain is invalid.'));
        }
        callback();
      };
      if(!options.checkDomain) {
        return cb(
          null, (signature.domain === null || signature.domain === undefined));
      }
      options.checkDomain(signature.domain, options, cb);
    }],
    checkDate: ['frame', function(callback, results) {
      if(!checkTimestamp) {
        return callback();
      }

      // ensure signature timestamp within a valid range
      var now = new Date().getTime();
      var delta = maxTimestampDelta * 1000;
      try {
        var signature = results.frame.signature;
        var created = Date.parse(signature.created);
        if(created < (now - delta) || created > (now + delta)) {
          throw new Error('[jsigs.verify] ' +
            'The message digital signature timestamp is out of range.');
        }
      } catch(ex) {
        return callback(ex);
      }
      callback();
    }],
    getPublicKey: ['frame', function(callback, results) {
      if(options.publicKey) {
        return callback(null, options.publicKey);
      }
      var signature = results.frame.signature;
      api.getPublicKey(signature.creator, options, callback);
    }],
    checkKey: ['getPublicKey', function(callback, results) {
      if('revoked' in results.getPublicKey) {
        return callback(new Error('[jsigs.verify] ' +
          'The message was signed with a key that has been revoked.'));
      }
      var cb = function(err, trusted) {
        if(err) {
          return callback(err);
        }
        if(!trusted) {
          throw new Error('[jsigs.verify] ' +
            'The message was not signed with a trusted key.');
        }
        callback();
      };
      if(options.checkKey) {
        return options.checkKey(results.getPublicKey, options, cb);
      }
      api.checkKey(results.getPublicKey, options, cb);
    }],
    normalize: ['checkNonce', 'checkDate', 'checkKey',
      function(callback, results) {
      // remove signature property from object
      var result = results.frame;
      var signature = result.signature;
      delete result.signature;
      var normalizeAlgorithm = (algorithm === 'GraphSignature2012' ?
        'URGNA2012' : 'URDNA2015');
      jsonld.normalize(
        result, {algorithm: normalizeAlgorithm, format: 'application/nquads'},
        function(err, normalized) {
          if(err) {
            return callback(err);
          }
          callback(null, {data: normalized, signature: signature});
        }
      );
    }],
    verifySignature: ['normalize', function(callback, results) {
      var key = results.getPublicKey;
      var signature = results.normalize.signature;
      _verifySignature(results.normalize.data, signature.signatureValue, {
        algorithm: algorithm,
        publicKeyPem: key.publicKeyPem,
        publicKeyWif: key.publicKeyWif,
        nonce: signature.nonce,
        date: signature.created,
        domain: signature.domain
      }, callback);
    }]
  }, function(err, results) {
    callback(err, results.verifySignature);
  });
}

/**
 * Implements the node.js/browser-specific code for creating a digital
 * signature.
 *
 * @param input the data to sign.
 * @param options options to use:
 *          algorithm 'GraphSignature2012' or 'LinkedDataSignature2015'.
 *          privateKeyPem A PEM-encoded private key.
 *          [date] an optional date to override the signature date with.
 *          [domain] an optional domain to include in the signature.
 *          [nonce] an optional nonce to include in the signature.
 * @param callback(err, signature) called once the operation completes.
 */
var _createSignature = function(input, options, callback) {
  var signature, privateKey;

  if(options.algorithm === 'EcdsaKoblitzSignature2016') {
    // works same in any environment
    try {
      var bitcoreMessage = api.use('bitcoreMessage');
      var bitcore = bitcoreMessage.Bitcore;
      privateKey = bitcore.PrivateKey.fromWIF(options.privateKeyWif);
      var message = bitcoreMessage(_getDataToHash(input, options));
      signature = message.sign(privateKey);
    } catch(err) {
      return callback(err);
    }
    return callback(null, signature);
  }

  if(_nodejs) {
    // optimize using node libraries
    try {
      var crypto = api.use('crypto');
      var signer = crypto.createSign('RSA-SHA256');
      signer.update(_getDataToHash(input, options), 'utf8');
      signature = signer.sign(options.privateKeyPem, 'base64');
    } catch(err) {
      return callback(err);
    }
    return callback(null, signature);
  }

  // browser or other environment
  try {
    var forge = api.use('forge');
    privateKey = forge.pki.privateKeyFromPem(options.privateKeyPem);
    var md = forge.md.sha256.create();
    md.update(_getDataToHash(input, options), 'utf8');
    signature = forge.util.encode64(privateKey.sign(md));
  } catch(err) {
    return callback(err);
  }
  callback(null, signature);
};

/**
 * Implements the node.js/browser-specific code for creating a digital
 * signature.
 *
 * @param input the data associated with the signature.
 * @param signature the base-64 encoded signature on the data.
 * @param options options to use:
 *          algorithm 'GraphSignature2012' or 'LinkedDataSignature2015'.
 *          publicKeyPem A PEM-encoded public key.
 *          [date] an optional date to override the signature date with.
 *          [domain] an optional domain to include in the signature.
 *          [nonce] an optional nonce to include in the signature.
 * @param callback(err, valid) called once the operation completes.
 */
var _verifySignature = function(input, signature, options, callback) {
  var verified;

  if(options.algorithm === 'EcdsaKoblitzSignature2016') {
    // works same in any environment
    try {
      var bitcoreMessage = api.use('bitcoreMessage');
      var message = bitcoreMessage(_getDataToHash(input, options));
      verified = message.verify(options.publicKeyWif, signature);
      return callback(null, verified);
    } catch (err) {
      return callback(err);
    }
  }

  if(_nodejs) {
    // optimize using node libraries
    var crypto = api.use('crypto');
    var verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(_getDataToHash(input, options), 'utf8');
    verified = verifier.verify(options.publicKeyPem, signature, 'base64');
    return callback(null, verified);
  }

  // browser or other environment
  var forge = api.use('forge');
  var publicKey = forge.pki.publicKeyFromPem(options.publicKeyPem);
  var md = forge.md.sha256.create();
  md.update(_getDataToHash(input, options), 'utf8');
  verified = publicKey.verify(
    md.digest().bytes(), forge.util.decode64(signature));
  callback(null, verified);
};

function _getDataToHash(input, options) {
  var toHash = '';
  if(options.algorithm === 'GraphSignature2012') {
    if(options.nonce !== null && options.nonce !== undefined) {
      toHash += options.nonce;
    }
    toHash += options.date;
    toHash += input;
    if(options.domain !== null && options.domain !== undefined) {
      toHash += '@' + options.domain;
    }
  } else if(options.algorithm === 'LinkedDataSignature2015') {
    var headers = {
      'http://purl.org/dc/elements/1.1/created': options.date,
      'https://w3id.org/security#domain': options.domain,
      'https://w3id.org/security#nonce': options.nonce
    };
    // add headers in lexicographical order
    var keys = Object.keys(headers).sort();
    for(var i = 0; i < keys.length; ++i) {
      var key = keys[i];
      var value = headers[key];
      if(value !== null && value !== undefined) {
        toHash += key + ': ' + value + '\n';
      }
    }
    toHash += input;
  }
  return toHash;
}

/**
 * Clones a value. If the value is an array or an object it will be deep cloned.
 *
 * @param value the value to clone.
 *
 * @return the cloned value.
 */
function _deepClone(value) {
  if(value && typeof value === 'object') {
    var rval;
    if(Array.isArray(value)) {
      rval = new Array(value.length);
      for(var i = 0; i < rval.length; i++) {
        rval[i] = _deepClone(value[i]);
      }
    } else {
      rval = {};
      for(var j in value) {
        rval[j] = _deepClone(value[j]);
      }
    }
    return rval;
  }
  return value;
}

/**
 * Converts the given date into W3C datetime format (eg: 2011-03-09T21:55:41Z).
 *
 * @param date the date to convert.
 *
 * @return the date in W3C datetime format.
 */
function _w3cDate(date) {
  if(date === undefined || date === null) {
    date = new Date();
  } else if(typeof date === 'number' || typeof date === 'string') {
    date = new Date(date);
  }

  return date.getUTCFullYear() + '-' +
    _zeroFill(date.getUTCMonth() + 1) + '-' +
    _zeroFill(date.getUTCDate())  + 'T' +
    _zeroFill(date.getUTCHours()) + ':' +
    _zeroFill(date.getUTCMinutes()) + ':' +
    _zeroFill(date.getUTCSeconds()) + 'Z';
}

function _zeroFill(num) {
  return (num < 10) ? '0' + num : '' + num;
}

/* Promises API */

/**
 * Creates a new promises API object.
 *
 * @param [options] the options to use:
 *          [api] an object to attach the API to.
 *          [version] 'jsonld-signatures-1.0' to output a standard Linked Data
 *            Signatures 1.0 promises API, 'jsigs' to output the same with
 *            augmented proprietary methods (default: 'jsigs')
 *
 * @return the promises API object.
 */
api.promises = function(options) {
  options = options || {};
  var slice = Array.prototype.slice;
  var jsonld = api.use('jsonld');
  var promisify = jsonld.promisify;

  // handle 'api' option as version, set defaults
  var papi = options.api || {};
  var version = options.version || 'jsigs';
  if(typeof options.api === 'string') {
    if(!options.version) {
      version = options.api;
    }
    papi = {};
  }

  papi.sign = function() {
    if(arguments.length < 2) {
      throw new TypeError('Could not sign, too few arguments.');
    }
    return promisify.apply(null, [api.sign].concat(slice.call(arguments)));
  };

  papi.verify = function() {
    if(arguments.length < 2) {
      throw new TypeError('Could not verify, too few arguments.');
    }
    return promisify.apply(null, [api.verify].concat(slice.call(arguments)));
  };

  try {
    api.Promise = global.Promise || require('es6-promise').Promise;
  } catch(e) {
    var f = function() {
      throw new Error('Unable to find a Promise implementation.');
    };
    for(var method in api) {
      papi[method] = f;
    }
  }

  return papi;
};

// extend default promises call w/promise API
try {
  api.promises({api: api.promises});
} catch(e) {}

return api;

} // end wrap

// used to generate a new verifier API instance
var factory = function(options) {
  return wrap(function() {return factory();}, options);
};
wrap(factory);

if(_nodejs) {
  // export nodejs API
  module.exports = factory;
} else if(typeof define === 'function' && define.amd) {
  // export AMD API
  define([], function() {
    return factory;
  });
} else if(_browser) {
  // export simple browser API
  if(typeof global.jsigs === 'undefined') {
    global.jsigs = {};
  }
  wrap(global.jsigs);
}

})(typeof window !== 'undefined' ? window : this);
