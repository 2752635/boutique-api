const { Role } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const result = await Role.findAndCountAll({ limit, offset, order: [['id', 'ASC']] });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle introuvable' });
    res.json(role);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    if (await Role.findOne({ where: { nom: req.body.nom } })) {
      return res.status(409).json({ message: 'Ce rôle existe déjà' });
    }
    const role = await Role.create({ nom: req.body.nom, description: req.body.description });
    res.status(201).json(role);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle introuvable' });
    const data = {};
    ['nom', 'description'].forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    await role.update(data);
    res.json(role);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const role = await Role.findByPk(req.params.id);
    if (!role) return res.status(404).json({ message: 'Rôle introuvable' });
    await role.destroy();
    res.json({ message: 'Rôle supprimé' });
  } catch (err) { res.status(400).json({ message: 'Suppression impossible (rôle utilisé ?)' }); }
};
