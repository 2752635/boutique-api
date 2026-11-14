const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { verifyToken, authorize } = require('../middlewares/auth');
const c = require('../controllers/userController');

router.use(verifyToken);

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');

router.get('/', authorize('admin'), c.getAll);
router.get('/:id', authorize('admin'), idRule, validate, c.getOne);

router.post('/', authorize('admin'), upload('users').single('photo'), [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('motDePasse').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  body('roleId').isInt({ min: 1 }).withMessage('roleId invalide'),
], validate, c.create);

router.put('/:id', upload('users').single('photo'), idRule, [
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('prenom').optional().trim().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('roleId').optional().isInt({ min: 1 }).withMessage('roleId invalide'),
  body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
  body('motDePasse').optional().isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
], validate, c.update);

router.delete('/:id', authorize('admin'), idRule, validate, c.remove);

module.exports = router;
