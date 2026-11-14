const { Op } = require('sequelize');
const { Category } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');
const { filePath, removeFile } = require('../utils/files');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = req.query.q ? { nom: { [Op.like]: `%${req.query.q}%` } } : {};
    const result = await Category.findAndCountAll({ where, limit, offset, order: [['nom', 'ASC']] });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    res.json(cat);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    if (await Category.findOne({ where: { nom: req.body.nom } })) {
      return res.status(409).json({ message: 'Cette catégorie existe déjà' });
    }
    const cat = await Category.create({
      nom: req.body.nom, description: req.body.description, image: filePath('categories', req.file),
    });
    res.status(201).json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    const data = {};
    ['nom', 'description'].forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.file) { removeFile(cat.image); data.image = filePath('categories', req.file); }
    await cat.update(data);
    res.json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'Catégorie introuvable' });
    await cat.destroy();
    removeFile(cat.image);
    res.json({ message: 'Catégorie supprimée' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
