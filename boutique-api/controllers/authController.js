const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { filePath } = require('../utils/files');

const signToken = (user, roleName) =>
  jwt.sign({ id: user.id, role: roleName }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse } = req.body;
    if (await User.findOne({ where: { email } })) {
      return res.status(409).json({ message: 'Cet email est déjà utilisé' });
    }
    const role = await Role.findOne({ where: { nom: 'client' } });
    if (!role) return res.status(500).json({ message: "Rôle 'client' introuvable (lancez npm run seed)" });

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({
      nom, prenom, email, motDePasse: hash, roleId: role.id,
      photo: filePath('users', req.file),
    });
    res.status(201).json({ message: 'Compte créé', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
    const user = await User.scope('withPassword').findOne({
      where: { email }, include: [{ model: Role, as: 'role' }],
    });
    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasse))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
    const token = signToken(user, user.role.nom);
    res.json({
      token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role.nom },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
