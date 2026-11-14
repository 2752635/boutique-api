const fs = require('fs');
const path = require('path');

// Supprime une ancienne image du disque (si elle existe)
exports.removeFile = (relativePath) => {
  if (!relativePath) return;
  const full = path.join(__dirname, '..', relativePath);
  fs.unlink(full, () => {});
};

// Chemin stocké en base, ex: uploads/products/123.png
exports.filePath = (folder, file) => (file ? `uploads/${folder}/${file.filename}` : undefined);
