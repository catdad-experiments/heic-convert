const jpegJs = require('jpeg-js');
const { PNG } = require('pngjs');

const decode = require('heic-decode');

const to = {
  JPEG: ({ data, width, height, quality }) => jpegJs.encode({ data, width, height }, quality).data,
  PNG: ({ data, width, height }) => {
    const png = new PNG({ width, height });
    png.data = data;

    return PNG.sync.write(png, {
      width: width,
      height: height,
      deflateLevel: 9,
      deflateStrategy: 3,
      filterType: -1,
      colorType: 6,
      inputHasAlpha: true
    });
  }
};

module.exports = async ({ buffer, format, quality = 0.92 }) => {
  if (!to[format]) {
    throw new Error(`output format needs to be one of [${Object.keys(to)}]`);
  }

  const { width, height, data } = await decode({ buffer });

  return await to[format]({ width, height, data: Buffer.from(data), quality: Math.floor(quality * 100) });
};
