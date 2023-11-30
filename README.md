# heic-convert

> Convert HEIC/HEIF images to JPEG and PNG

[![ci][ci.svg]][ci.link]
[![npm-downloads][npm-downloads.svg]][npm.link]
[![npm-version][npm-version.svg]][npm.link]

[ci.svg]: https://github.com/catdad-experiments/heic-convert/actions/workflows/ci.yml/badge.svg
[ci.link]: https://github.com/catdad-experiments/heic-convert/actions/workflows/ci.yml
[npm-downloads.svg]: https://img.shields.io/npm/dm/heic-convert.svg
[npm.link]: https://www.npmjs.com/package/heic-convert
[npm-version.svg]: https://img.shields.io/npm/v/heic-convert.svg

## Install

```bash
npm install heic-convert
```

## Usage in NodeJS

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

## Usage in the browser

While the NodeJS version of `heic-convert` may be compiled for use in the browser with something like `webpack`, [not all build tools necessarily like to compile all modules well](https://github.com/catdad-experiments/heic-convert/issues/29). However, what further complicates things is that this module uses pure-javascript implementations of a jpeg and png encoder. But the browser has its own native encoders! Let's just use those instead of including a ton of extra code in your bundle.

When compiling a client-side project, use:

```javascript
const convert = require('heic-convert/browser');
```

This is currently only supported in the main thread. Support for workers may be added in the future, but if you need it sooner, please create an issue or even a PR!

## Related

* [heic-cli](https://github.com/catdad-experiments/heic-cli) - convert heic/heif images to jpeg or png from the command line
* [heic-decode](https://github.com/catdad-experiments/heic-decode) - decode heic images to raw image data
* [libheif-js](https://github.com/catdad-experiments/libheif-js) - libheif as a pure-javascript npm module
