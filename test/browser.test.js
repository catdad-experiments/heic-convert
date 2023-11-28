const JSDOM = require('jsdom').JSDOM;
const canvas = require('canvas');
const runTests = require('./run-tests.js');

describe('heic-convert (browser)', () => {
  before(() => {
    const { window } = new JSDOM(``, {
      pretendToBeVisual: true
    });

    global.window = window;
    global.document = window.document;
    global.ImageData = canvas.ImageData;

    // okay, now we are getting hacky... jsdom folks got into a
    // fight when talking about implementing this spec, which
    // is now broadly supported across all evergreen browsers
    // https://github.com/jsdom/jsdom/issues/2555
    global.window.Blob.prototype.arrayBuffer = async function() {
      const blob = this;
      const fileReader = new window.FileReader();

      var arrayBuffer = new Promise(r => {
        fileReader.onload = function(event) {
          r(event.target.result);
        };

        fileReader.readAsArrayBuffer(blob);
      });

      return arrayBuffer;
    };
  });

  after(() => {
    global.window.close();
    delete global.window;
  });

  runTests(require('../browser'));
});
