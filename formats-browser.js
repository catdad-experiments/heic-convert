const convert = async ({ data, width, height }, type, quality) => {
  const canvas = new OffscreenCanvas(width, height);

  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(data, width, height), 0, 0);

  const blob = await canvas.convertToBlob({ type, quality })
  const arrayBuffer = await blob.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};

module.exports = {
  JPEG: async ({ data, width, height, quality }) => await convert({ data, width, height }, 'image/jpeg', quality),
  PNG: async ({ data, width, height }) => await convert({ data, width, height }, 'image/png')
};
