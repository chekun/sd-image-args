/* eslint-disable no-undef */
const { readFileSync } = require('fs')
const http = require('http')
const https = require('https')

/**
 * Reads the content of a file at the given file path.
 *
 * @param {string} filePath - The path to the file.
 * @return {string} The content of the file.
 */
window.readFile = function (filePath) {
  return readFileSync(filePath)
}

/**
 * Convert a base64 string to a buffer.
 *
 * @param {string} b64 - The base64 string to convert.
 * @return {Buffer} The resulting buffer.
 */
window.b64ToBuffer = function (b64) {
  if (b64.includes(';base64,')) {
    b64 = b64.split(';base64,')[1]
  }
  return Buffer.from(b64, 'base64')
}

window.bufferToB64 = function (buffer) {
  return buffer.toString('base64')
}

window.getJpegExifBuffer = function (buffer) {
  const exifStart = buffer.indexOf(Buffer.from([0xFF, 0xE1]))
  const exifLength = (buffer.readUInt16BE(exifStart + 2) + 2)
  return buffer.slice(exifStart+4, exifStart+4 + exifLength)
}

window.isPngOrJpg = function (buffer) {
  if (buffer.indexOf(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) === 0) {
    return 'png'
  } else if (buffer.indexOf(Buffer.from([0xFF, 0xD8])) === 0 && buffer.indexOf(Buffer.from([0xFF, 0xD9])) + 2 === buffer.length) {
    return 'jpg'
  }
  return ''
}

window.downloadImage = function (imageUrl) {
  return new Promise((resolve, reject) => {
    const handler = imageUrl.toLowerCase().startsWith('https://') ? https.get : http.get
    const req = handler(imageUrl, (response) => {
      let data = Buffer.from([]);
      response.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      });
      response.on('end', () => {
        resolve(data);
      });
    });
    req.end();
  });
}