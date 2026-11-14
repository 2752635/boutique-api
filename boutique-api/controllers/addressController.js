const { Address, User } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');

const userInclude = [{ model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] }];

// Un client voit ses adresses, l'admin voit tout
exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
    if (req.user.role === 'admin' && req.query.userId) where.userId = req.query.userId;
    if (req.query.ville) where.ville = req.query.ville;
    const result = await Address.findAndCountAll({
      where, limit, offset, order: [['id', 'DESC']], include: userInclude,
    });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id, { include: userInclude });
    if (!address) return res.status(404).json({ message: 'Adresse introuvable' });
    if (req.user.role !== 'admin' && address.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(address);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { rue, ville, province, codePostal, pays, parDefaut } = req.body;
    // une seule adresse par défaut par utilisateur
    if (parDefaut) await Address.update({ parDefaut: false }, { where: { userId: req.user.id } });
    const address = await Address.create({
      rue, ville, province, codePostal, pays, parDefaut: !!parDefaut, userId: req.user.id,
    });
    res.status(201).json(address);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Adresse introuvable' });
    if (req.user.role !== 'admin' && address.userId !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos adresses' });
    }
    if (req.body.parDefaut) await Address.update({ parDefaut: false }, { where: { userId: address.userId } });
    const champs = ['rue', 'ville', 'province', 'codePostal', 'pays', 'parDefaut'];
    const data = {};
    champs.forEach((c) => { if (req.body[c] !== undefined) data[c] = req.body[c]; });
    await address.update(data);
    res.json(address);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const address = await Address.findByPk(req.params.id);
    if (!address) return res.status(404).json({ message: 'Adresse introuvable' });
    if (req.user.role !== 'admin' && address.userId !== req.user.id) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos adresses' });
    }
    await address.destroy();
    res.json({ message: 'Adresse supprimée' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
