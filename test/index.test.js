/* eslint-env mocha */
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = require('rootrequire');
const { fromBuffer: filetype } = require('file-type');
const { expect } = require('chai');

const convert = require('../');

const readFile = promisify(fs.readFile);

describe('heic-convert', () => {
  it('exports a function', () => {
    expect(convert).to.be.a('function');
  });

  const assertImage = async (buffer, mime, hash) => {
    const type = await filetype(buffer);
    expect(type.mime).to.equal(mime);

    const actual = crypto.createHash('sha256').update(buffer).digest('hex');
    expect(actual).to.equal(hash);
  };

  it('converts known image to jpeg', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));

    // quality of 92%
    const output92 = await convert({ buffer, format: 'JPEG' });
    await assertImage(output92, 'image/jpeg', 'a7957c0517ef4c06a605a41097e3b500b7947151aec7873b4e604bfc2a82e8d6');

    // quality of 100%
    const output100 = await convert({ buffer, format: 'JPEG', quality: 1 });
    await assertImage(output100, 'image/jpeg', 'f7f1ae16c3fbf035d1b71b1995230305125236d0c9f0513c905ab1cb39fc68e9');
  });

  it('throws if data other than a HEIC image is passed in', async () => {
    const buffer = Buffer.from(Math.random().toString() + Math.random().toString());

    try {
      await convert({ buffer, format: 'JPEG' });
      throw new Error('decoding succeeded when it was expected to fail');
    } catch (e) {
      expect(e).to.be.instanceof(TypeError)
        .and.to.have.property('message', 'input buffer is not a HEIC image');
    }
  });
});
