const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING(100), allowNull: false },
  prenom: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
  motDePasse: { type: DataTypes.STRING(255), allowNull: false },
  photo: { type: DataTypes.STRING(255) },
}, {
  tableName: 'users',
  defaultScope: { attributes: { exclude: ['motDePasse'] } },
  scopes: { withPassword: { attributes: {} } },
});

// Ne jamais renvoyer le mot de passe (même haché) dans les réponses JSON
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.motDePasse;
  return values;
};

module.exports = User;
