const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/auth');
const c = require('../controllers/reviewController');

const idRule = param('id').isInt({ min: 1 }).withMessage('Identifiant invalide');
// fonction : chaque appel crée une nouvelle règle (sinon .optional() modifierait aussi celle du POST)
const noteRule = () => body('note').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5');

router.get('/', c.getAll);
router.get('/:id', idRule, validate, c.getOne);

router.post('/', verifyToken, [
  body('productId').isInt({ min: 1 }).withMessage('productId invalide'),
  noteRule(),
  body('commentaire').optional().isString(),
], validate, c.create);

router.put('/:id', verifyToken, idRule, [noteRule().optional()], validate, c.update);
router.delete('/:id', verifyToken, idRule, validate, c.remove);

module.exports = router;
