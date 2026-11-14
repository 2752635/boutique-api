const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Role } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');
const { filePath, removeFile } = require('../utils/files');

exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.q) {
      where[Op.or] = [
        { nom: { [Op.like]: `%${req.query.q}%` } },
        { prenom: { [Op.like]: `%${req.query.q}%` } },
        { email: { [Op.like]: `%${req.query.q}%` } },
      ];
    }
    const result = await User.findAndCountAll({
      where, limit, offset, order: [['id', 'DESC']],
      include: [{ model: Role, as: 'role' }],
    });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: [{ model: Role, as: 'role' }] });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Admin : peut créer un utilisateur avec n'importe quel rôle
exports.create = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, roleId } = req.body;
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    if (!(await Role.findByPk(roleId))) return res.status(404).json({ message: 'Rôle introuvable' });
    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({
      nom, prenom, email, motDePasse: hash, roleId, photo: filePath('users', req.file),
    });
    res.status(201).json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// Un utilisateur modifie son propre profil, l'admin modifie tout le monde
exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que votre profil' });
    }
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (req.body.email && req.body.email !== user.email && (await User.findOne({ where: { email: req.body.email } }))) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    if (req.user.role === 'admin' && req.body.roleId && !(await Role.findByPk(req.body.roleId))) {
      return res.status(404).json({ message: 'Rôle introuvable' });
    }

    const data = {};
    ['nom', 'prenom', 'email'].forEach((k) => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    if (req.body.motDePasse) data.motDePasse = await bcrypt.hash(req.body.motDePasse, 10);
    if (req.user.role === 'admin' && req.body.roleId) data.roleId = req.body.roleId;
    if (req.file) { removeFile(user.photo); data.photo = filePath('users', req.file); }

    await user.update(data);
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    await user.destroy();
    removeFile(user.photo); // après destroy : si la suppression échoue, on garde l'image
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) { res.status(400).json({ message: 'Suppression impossible (commandes liées ?)' }); }
};
