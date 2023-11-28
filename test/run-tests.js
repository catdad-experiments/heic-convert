/* eslint-env mocha */
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const root = require('rootrequire');
const { fromBuffer: filetype } = require('file-type');
const { expect } = require('chai');
const toUint8 = require('buffer-to-uint8array');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const jpegJs = require('jpeg-js');

const readFile = promisify(fs.readFile);

module.exports = function runTests(convert) {
  it('exports a function', () => {
    expect(convert).to.be.a('function');
  });

  const decode = {
    'image/png': buffer => PNG.sync.read(Buffer.from(buffer)),
    'image/jpeg': buffer => jpegJs.decode(Buffer.from(buffer))
  };

  const readControl = async name => {
    const buffer = await readFile(path.resolve(root, `temp/${name}`));
    return decode['image/png'](buffer);
  };

  const compare = (expected, actual, width, height, errString = 'actual image did not match control image') => {
    const result = pixelmatch(toUint8(Buffer.from(expected)), toUint8(Buffer.from(actual)), null, width, height, {
      threshold: 0.1
    });

    // allow 5% of pixels to be different
    expect(result).to.be.below(width * height * 0.05, errString);
  };

  const assertImage = async (buffer, mime, control) => {
    expect(buffer).to.be.instanceOf(Uint8Array);

    const type = await filetype(buffer);
    expect(type.mime).to.equal(mime);

    const actual = decode[mime](buffer);

    expect(actual.width).to.equal(control.width);
    expect(actual.height).to.equal(control.height);

    compare(control.data, actual.data, control.width, control.height);
  };

  it('converts known image to jpeg', async () => {
    const control = await readControl('0002-control.png');
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));

    // quality of 92%
    const output92 = await convert({ buffer, format: 'JPEG' });
    await assertImage(output92, 'image/jpeg', control);

    // quality of 100%
    const output100 = await convert({ buffer, format: 'JPEG', quality: 1 });
    await assertImage(output100, 'image/jpeg', control);

    expect(output92).to.not.deep.equal(output100);
    expect(output92.length).to.be.below(output100.length);
  });

  it('converts known image to png', async () => {
    const control = await readControl('0002-control.png');
    const buffer = await readFile(path.resolve(root, 'temp', '0002.heic'));

    const output = await convert({ buffer, format: 'PNG' });
    await assertImage(output, 'image/png', control);
  });

  it('converts multiple images inside a single file to jpeg', async () => {
    const controls = await Promise.all([
      readControl('0003-0-control.png'),
      readControl('0003-1-control.png'),
    ]);
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await convert.all({ buffer, format: 'JPEG' });

    expect(images).to.have.lengthOf(3);

    for (let { i, control } of [
      { i: 0, control: controls[0] },
      { i: 1, control: controls[1] },
      { i: 2, control: controls[1] },
    ]) {
      expect(images[i]).to.have.a.property('convert').and.to.be.a('function');
      await assertImage(await images[i].convert(), 'image/jpeg', control);
    }
  });

  it('converts multiple images inside a single file to png', async () => {
    const controls = await Promise.all([
      readControl('0003-0-control.png'),
      readControl('0003-1-control.png'),
    ]);
    const buffer = await readFile(path.resolve(root, 'temp', '0003.heic'));
    const images = await convert.all({ buffer, format: 'PNG' });

    expect(images).to.have.lengthOf(3);

    for (let { i, control } of [
      { i: 0, control: controls[0] },
      { i: 1, control: controls[1] },
      { i: 2, control: controls[1] },
    ]) {
      expect(images[i]).to.have.a.property('convert').and.to.be.a('function');
      await assertImage(await images[i].convert(), 'image/png', control);
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
}
