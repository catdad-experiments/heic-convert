module.exports = {};

const initializeCanvas = ({ data, width, height }) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const imageData = new ImageData(data, width, height);

  ctx.putImageData(imageData, 0, 0);

  return canvas;
};

const convert = async ({ data, width, height }, ...blobArgs) => {
  const canvas = initializeCanvas({ data, width, height });

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        return resolve(blob);
      }

      return reject(new Error('failed to convert the image'));
    }, ...blobArgs);
  });

  const arrayBuffer = await blob.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};

module.exports.JPEG = async ({ data, width, height, quality }) => {
  return convert({ data, width, height }, 'image/jpeg', quality);
};

module.exports.PNG = async ({ data, width, height }) => {
  return convert({ data, width, height }, 'image/png');
};
