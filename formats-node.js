const jpegJs = require('jpeg-js');
const { PNG } = require('pngjs');

module.exports = {};

module.exports.JPEG = ({ data, width, height, quality }) => jpegJs.encode({ data, width, height }, quality).data;

module.exports.PNG = ({ data, width, height }) => {
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
};
