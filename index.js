const { promisify } = require('util');

const Jimp = require('jimp');
const decode = require('heic-decode');

const createImage = promisify(({ data, width, height }, callback) => {
  try {
    new Jimp({ data: Buffer.from(data), width, height }, callback);
  } catch (e) {
    callback(e);
  }
});

const to = {
  JPEG: async ({ image, quality }) => {
    return await image.quality(Math.floor(quality * 100)).getBufferAsync(Jimp.MIME_JPEG);
  },
  PNG: async ({ image }) => {
    return await image.getBufferAsync(Jimp.MIME_PNG);
  }
};

module.exports = async ({ buffer, format, quality = 0.92 }) => {
  if (!to[format]) {
    throw new Error(`output format needs to be one of ${Object.keys(to)}`);
  }

  const { width, height, data } = await decode({ buffer });

  const image = await createImage({ width, height, data });

  return await to[format]({ image, quality });
};
