const multer = require('multer');
const path = require('path');
const fs = require('fs');

// upload('products') => fichiers enregistrés dans uploads/products
module.exports = (folder) => {
  const dir = path.join(__dirname, '..', 'uploads', folder);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname).toLowerCase());
    },
  });

  const fileFilter = (req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Seules les images (jpeg, png, gif, webp) sont acceptées'));
  };

  return multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
};
