const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(path.join('public', 'models', filename));
    https.get(`${baseUrl}/${filename}`, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join('public', 'models', filename));
      reject(err);
    });
  });
};

const downloadAll = async () => {
  for (const model of models) {
    await downloadFile(model);
  }
};

downloadAll().catch(console.error); 