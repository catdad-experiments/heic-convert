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

const convertImage = async ({ image, format, quality }) => {
  return await to[format]({
    width: image.width,
    height: image.height,
    data: Buffer.from(image.data),
    quality: Math.floor(quality * 100)
  });
};

const convert = async ({ buffer, format, quality, all }) => {
  if (!to[format]) {
    throw new Error(`output format needs to be one of [${Object.keys(to)}]`);
  }

  if (!all) {
    const image = await decode({ buffer });
    return await convertImage({ image, format, quality });
  }

  const images = await decode.all({ buffer });

  return images.map(image => {
    return {
      convert: async () => await convertImage({
        image: await image.decode(),
        format,
        quality
      })
    };
  });
};

module.exports = async ({ buffer, format, quality = 0.92 }) => await convert({ buffer, format, quality, all: false });
module.exports.all = async ({ buffer, format, quality = 0.92 }) => await convert({ buffer, format, quality, all: true });
