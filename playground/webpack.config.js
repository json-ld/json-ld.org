const path = require('path');

module.exports = {
  entry: './fhircat-addons.js',
  output: {
    filename: 'fhircat-addons.js',
    path: path.resolve(__dirname, 'webpacks'),
  },
  resolve: { fallback: { "stream": false } },
  mode: 'development',
};
