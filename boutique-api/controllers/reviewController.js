const { Review, Product, User } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');

// GET /api/reviews?productId=1&page=1&limit=10
exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = req.query.productId ? { productId: req.query.productId } : {};
    const result = await Review.findAndCountAll({
      where, limit, offset, order: [['id', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'photo'] }],
    });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'photo'] }],
    });
    if (!review) return res.status(404).json({ message: 'Avis introuvable' });
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const product = await Product.findByPk(req.body.productId);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    if (await Review.findOne({ where: { productId: product.id, userId: req.user.id } })) {
      return res.status(409).json({ message: 'Vous avez déjà laissé un avis pour ce produit' });
    }
    const review = await Review.create({
      note: req.body.note, commentaire: req.body.commentaire,
      productId: product.id, userId: req.user.id,
    });
    res.status(201).json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Avis introuvable' });
    if (req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos avis' });
    }
    await review.update({ note: req.body.note ?? review.note, commentaire: req.body.commentaire ?? review.commentaire });
    res.json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Avis introuvable' });
    if (req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos avis' });
    }
    await review.destroy();
    res.json({ message: 'Avis supprimé' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
