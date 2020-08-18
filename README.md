# heic-convert

> Convert HEIC/HEIF images to JPEG and PNG

[![travis][travis.svg]][travis.link]
[![npm-downloads][npm-downloads.svg]][npm.link]
[![npm-version][npm-version.svg]][npm.link]

[travis.svg]: https://travis-ci.com/catdad-experiments/heic-convert.svg?branch=master
[travis.link]: https://travis-ci.com/catdad-experiments/heic-convert
[npm-downloads.svg]: https://img.shields.io/npm/dm/heic-convert.svg
[npm.link]: https://www.npmjs.com/package/heic-convert
[npm-version.svg]: https://img.shields.io/npm/v/heic-convert.svg

## Install

```bash
npm install heic-convert
```

## Usage

Convert the main image in a HEIC to JPEG

```javascript
const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');

(async () => {
  const inputBuffer = await promisify(fs.readFile)('/path/to/my/image.heic');
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG',      // output format
    quality: 1           // the jpeg compression quality, between 0 and 1
  });

  await promisify(fs.writeFile)('./result.jpg', outputBuffer);
})();
```

Convert the main image in a HEIC to PNG

```javascript
const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');

(async () => {
  const inputBuffer = await promisify(fs.readFile)('/path/to/my/image.heic');
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'PNG'        // output format
  });

  await promisify(fs.writeFile)('./result.png', outputBuffer);
})();
```

Convert all images in a HEIC

```javascript
const { promisify } = require('util');
const fs = require('fs');
const convert = require('heic-convert');

(async () => {
  const inputBuffer = await promisify(fs.readFile)('/path/to/my/image.heic');
  const images = await convert.all({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'JPEG'       // output format
  });

  for (let idx in images) {
    const image = images[idx];
    const outputBuffer = await image.convert();
    await promisify(fs.writeFile)(`./result-${idx}.jpg`, outputBuffer);
  }
})();
```

The work to convert an image is done when calling `image.convert()`, so if you only need one of the images in a multi-image file, you can convert just that one from the `images` array and skip doing any work for the remaining images.

_Note that while the converter returns a Promise and is overall asynchronous, a lot of work is still done synchronously, so you should consider using a worker thread in order to not block the main thread in highly concurrent production environments._

## Related

* [heic-cli](https://github.com/catdad-experiments/heic-cli) - convert heic/heif images to jpeg or png from the command line
* [heic-decode](https://github.com/catdad-experiments/heic-decode) - decode heic images to raw image data
* [libheif-js](https://github.com/catdad-experiments/libheif-js) - libheif as a pure-javascript npm module
