const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { verifyToken, authorize } = require('../middlewares/auth');
const c = require('../controllers/categoryController');

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');

// Lecture publique
router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);

// Écriture : admin seulement
router.post('/', verifyToken, authorize('admin'), upload('categories').single('image'), [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
], validate, c.create);
router.put('/:id', verifyToken, authorize('admin'), upload('categories').single('image'), idRule, [
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
], validate, c.update);
router.delete('/:id', verifyToken, authorize('admin'), idRule, validate, c.remove);

module.exports = router;
