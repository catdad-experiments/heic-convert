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

  it('converts known image to png', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));

    const output = await convert({ buffer, format: 'PNG' });
    await assertImage(output, 'image/png', '0efc9a4c58d053fb42591acd83f8a5005ee2844555af29b5aba77a766b317935');
  });

  it('converts multiple images inside a single file to jpeg', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await convert.all({ buffer, format: 'JPEG' });

    expect(images).to.have.lengthOf(3);

    for (let { i, hash: expectedHash } of [
      { i: 0, hash: '2d9dc6e640b301e4614ac37368a706236ed421d9b928f6916429b0076fe47654' },
      { i: 1, hash: '141a9cf07b46ffb2718246b40442cd0df0bcd4ee7d94b25bc3d1164e90fbc95b' },
      { i: 2, hash: '141a9cf07b46ffb2718246b40442cd0df0bcd4ee7d94b25bc3d1164e90fbc95b' },
    ]) {
      expect(images[i]).to.have.a.property('convert').and.to.be.a('function');
      await assertImage(await images[i].convert(), 'image/jpeg', expectedHash);
    }
  });

  it('converts multiple images inside a single file to png', async () => {
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await convert.all({ buffer, format: 'PNG' });

    expect(images).to.have.lengthOf(3);

    for (let { i, hash: expectedHash } of [
      { i: 0, hash: '14f4a6b316f511699bf686e60b8bd7b34cc6953aeaed0fb344e6211eaaf3b83a' },
      { i: 1, hash: '1e8745b336ade784e761028bc34e1906538487efffe667a33cd705033f36e728' },
      { i: 2, hash: '1e8745b336ade784e761028bc34e1906538487efffe667a33cd705033f36e728' },
    ]) {
      expect(images[i]).to.have.a.property('convert').and.to.be.a('function');
      await assertImage(await images[i].convert(), 'image/png', expectedHash);
    }
  });

  [
    { when: 'converting only the main image', method: convert },
    { when: 'converting all images', method: convert.all }
  ].forEach(({ when, method }) => {
    it(`errors for an unknown output format when ${when}`, async () => {
      const buffer = Buffer.from(Math.random().toString() + Math.random().toString());

      let error;

      await method({ buffer, format: 'PINEAPPLES' }).catch(err => {
        error = err;
      });

      expect(error).to.be.instanceof(Error)
        .and.to.have.property('message', 'output format needs to be one of [JPEG,PNG]');
    });

    it(`errors if data other than a HEIC image is passed in when ${when}`, async () => {
      const buffer = Buffer.from(Math.random().toString() + Math.random().toString());

      let error;

      await method({ buffer, format: 'JPEG' }).catch(err => {
        error = err;
      });

      expect(error).to.be.instanceof(TypeError)
        .and.to.have.property('message', 'input buffer is not a HEIC image');
    });
  });
});
