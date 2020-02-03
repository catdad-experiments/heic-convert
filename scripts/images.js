/* eslint-disable no-console */
const path = require('path');
const root = require('rootrequire');
const fs = require('fs-extra');
const fetch = require('node-fetch');

const resolve = (name = '') => path.resolve(root, 'temp', name);
const drive = id => `http://drive.google.com/uc?export=view&id=${id}`;

const images = [{
  name: '0001.jpg',
  url: drive('1Mdlwd9i4i4HuVJjEcelUj6b0OAYkQHEj')
}, {
  name: '0002.heic', // single image
  url: drive('1J_761fe_HWSijAthq7h_D2Zsf1_es1cT')
}, {
  name: '0003.heic', // multiple images
  url: drive('1Iru2g084yZGz-eRagiqZgccRJZfGLYgS')
}].map(img => {
  img.path = resolve(img.name);
  return img;
});

(async () => {
  for (let image of images) {
    const { url, name } = image;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`failed to download ${name} at ${url}`);
    }

    const buffer = await res.buffer();
    await fs.outputFile(image.path, buffer);
  }
})().then(() => {
  console.log('all images fetch');
}).catch(err => {
  console.error('failed to fetch all images\n', err);
  process.exitCode = 1;
});
