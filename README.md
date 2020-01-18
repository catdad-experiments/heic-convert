# heic-convert

Convert HEIC/HEIF images to JPEG and PNG

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
npm install heic-decode
```

## Usage

Convert HEIC to JPEG

```javascript
const { promisify } = require('util');
const fs = require('fs');

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

Convert HEIC to PNG

```javascript
const { promisify } = require('util');
const fs = require('fs');

(async () => {
  const inputBuffer = await promisify(fs.readFile)('/path/to/my/image.heic');
  const outputBuffer = await convert({
    buffer: inputBuffer, // the HEIC file buffer
    format: 'PNG'        // output format
  });

  await promisify(fs.writeFile)('./result.png', outputBuffer);
})();
```

_Note that while the converter returns a Promise and is overall asynchronous, a lot of work is still done synchronously, so you should consider using a worker thread in order to not block the main thread in highly concurrent production environments._
