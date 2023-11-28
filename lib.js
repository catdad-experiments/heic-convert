module.exports = (decode, encode) => {
  const convertImage = async ({ image, format, quality }) => {
    return await encode[format]({
      width: image.width,
      height: image.height,
      data: image.data,
      quality
    });
  };

  const convert = async ({ buffer, format, quality, all }) => {
    if (!encode[format]) {
      throw new Error(`output format needs to be one of [${Object.keys(encode)}]`);
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

  return {
    one: async ({ buffer, format, quality = 0.92 }) => await convert({ buffer, format, quality, all: false }),
    all: async ({ buffer, format, quality = 0.92 }) => await convert({ buffer, format, quality, all: true })
  };
};
