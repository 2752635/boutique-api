const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');
const c = require('../controllers/authController');

router.post('/register', upload('users').single('photo'), [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('motDePasse').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
], validate, c.register);

router.post('/login', [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('motDePasse').notEmpty().withMessage('Mot de passe obligatoire'),
], validate, c.login);

router.get('/me', verifyToken, c.me);

module.exports = router;
