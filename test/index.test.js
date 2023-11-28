const runTests = require('./run-tests.js');

describe('heic-convert (default wasm)', () => {
  runTests(require('..'));
});

describe('heic-convert (legacy js)', () => {
  runTests(require('../legacy'));
});
