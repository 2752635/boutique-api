const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken, authorize } = require('../middlewares/auth');
const c = require('../controllers/orderController');

router.use(verifyToken);

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');

router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);

router.post('/', [
  body('addressId').optional().isInt({ min: 1 }).withMessage('addressId invalide'),
  body('items').isArray({ min: 1 }).withMessage('La commande doit contenir au moins un article'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('productId invalide'),
  body('items.*.quantite').isInt({ min: 1 }).withMessage('quantite doit être >= 1'),
], validate, c.create);

router.patch('/:id/cancel', idRule, validate, c.cancel);

router.patch('/:id/status', authorize('admin'), idRule, [
  body('statut').isIn(['en_attente', 'payee', 'expediee', 'livree', 'annulee']).withMessage('Statut invalide'),
], validate, c.updateStatus);

router.delete('/:id', authorize('admin'), idRule, validate, c.remove);

module.exports = router;
