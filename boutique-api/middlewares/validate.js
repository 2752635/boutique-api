const fs = require('fs');
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // supprimer l'image envoyée avec une requête invalide
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(422).json({
      message: 'Erreur de validation',
      errors: errors.array().map((e) => ({ champ: e.path, message: e.msg })),
    });
  }
  next();
};
