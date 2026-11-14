const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken, authorize } = require('../middlewares/auth');
const c = require('../controllers/roleController');

router.use(verifyToken, authorize('admin'));

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');

router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);
router.post('/', [body('nom').trim().notEmpty().withMessage('Le nom est obligatoire')], validate, c.create);
router.put('/:id', idRule, [
  body('nom').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
], validate, c.update);
router.delete('/:id', idRule, validate, c.remove);

module.exports = router;
