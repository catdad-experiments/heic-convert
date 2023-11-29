const initializeCanvas = ({ width, height }) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas;
};

const convert = async ({ data, width, height }, ...blobArgs) => {
  const canvas = initializeCanvas({ width, height });

  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(data, width, height), 0, 0);

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

module.exports = {
  JPEG: async ({ data, width, height, quality }) => await convert({ data, width, height }, 'image/jpeg', quality),
  PNG: async ({ data, width, height }) => await convert({ data, width, height }, 'image/png')
};
