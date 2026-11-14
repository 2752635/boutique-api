const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const c = require('../controllers/addressController');

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');
// Code postal canadien, ex: K1A 0B1
const codePostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

router.use(verifyToken);

router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);

router.post('/', [
  body('rue').trim().notEmpty().withMessage('La rue est obligatoire'),
  body('ville').trim().notEmpty().withMessage('La ville est obligatoire'),
  body('province').trim().notEmpty().withMessage('La province est obligatoire'),
  body('codePostal').trim().matches(codePostalRegex).withMessage('Code postal invalide (ex: K1A 0B1)'),
  body('pays').optional().trim().notEmpty(),
  body('parDefaut').optional().isBoolean().withMessage('parDefaut doit être true ou false').toBoolean(),
], validate, c.create);

router.put('/:id', idRule, [
  body('rue').optional().trim().notEmpty().withMessage('La rue ne peut pas être vide'),
  body('ville').optional().trim().notEmpty().withMessage('La ville ne peut pas être vide'),
  body('province').optional().trim().notEmpty(),
  body('codePostal').optional().trim().matches(codePostalRegex).withMessage('Code postal invalide (ex: K1A 0B1)'),
  body('parDefaut').optional().isBoolean().toBoolean(),
], validate, c.update);

router.delete('/:id', idRule, validate, c.remove);

module.exports = router;
