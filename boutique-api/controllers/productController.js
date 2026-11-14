const { Op } = require('sequelize');
const { Product, Category, Review } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');
const { filePath, removeFile } = require('../utils/files');

// GET /api/products?page=1&limit=10&q=clavier&categoryId=2&minPrix=10&maxPrix=100
exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.q) where.nom = { [Op.like]: `%${req.query.q}%` };
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.minPrix || req.query.maxPrix) {
      where.prix = {};
      if (req.query.minPrix) where.prix[Op.gte] = req.query.minPrix;
      if (req.query.maxPrix) where.prix[Op.lte] = req.query.maxPrix;
    }
    const result = await Product.findAndCountAll({
      where, limit, offset, order: [['id', 'DESC']],
      include: [{ model: Category, as: 'category', attributes: ['id', 'nom'] }],
    });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'category' },
        { model: Review, as: 'reviews' },
      ],
    });
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const category = await Category.findByPk(req.body.categoryId);
    if (!category) return res.status(404).json({ message: 'Catégorie introuvable' });
    const { nom, description, prix, stock } = req.body;
    const product = await Product.create({
      nom, description, prix, stock, categoryId: category.id, image: filePath('products', req.file),
    });
    res.status(201).json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    if (req.body.categoryId && !(await Category.findByPk(req.body.categoryId))) {
      return res.status(404).json({ message: 'Catégorie introuvable' });
    }
    const data = {};
    ['nom', 'description', 'prix', 'stock', 'categoryId'].forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.file) { removeFile(product.image); data.image = filePath('products', req.file); }
    await product.update(data);
    res.json(product);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit introuvable' });
    await product.destroy();
    removeFile(product.image);
    res.json({ message: 'Produit supprimé' });
  } catch (err) { res.status(400).json({ message: 'Suppression impossible (produit déjà commandé ?)' }); }
};
