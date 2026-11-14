const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { verifyToken, authorize } = require('../middlewares/auth');
const c = require('../controllers/productController');

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');

router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);

router.post('/', verifyToken, authorize('admin'), upload('products').single('image'), [
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('prix').isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
  body('categoryId').isInt({ min: 1 }).withMessage('categoryId invalide'),
], validate, c.create);

router.put('/:id', verifyToken, authorize('admin'), upload('products').single('image'), idRule, [
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('categoryId').optional().isInt({ min: 1 }).withMessage('categoryId invalide'),
  body('prix').optional().isFloat({ min: 0 }).withMessage('Prix invalide'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock invalide'),
], validate, c.update);

router.delete('/:id', verifyToken, authorize('admin'), idRule, validate, c.remove);

module.exports = router;
