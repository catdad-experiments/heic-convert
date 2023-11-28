const runTests = require('./run-tests.js');

describe('heic-convert (default wasm libheif)', () => {
  runTests(require('..'));
});

// I wouldn't say these are strictly required, but 🤷‍♀️
describe('heic-convert (legacy js libheif)', () => {
  const libheif = require('libheif-js/index.js');
  const decodeLib = require('heic-decode/lib.js');
  const formats = require('../formats-node.js');

  const { one: decodeOne, all: decodeAll } = decodeLib(libheif);
  decodeOne.all = decodeAll;

  const { one, all } = require('../lib.js')(decodeOne, formats);

  const convert = one;
  convert.all = all;

  runTests(convert);
});
