const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  rue: { type: DataTypes.STRING(255), allowNull: false },
  ville: { type: DataTypes.STRING(100), allowNull: false },
  province: { type: DataTypes.STRING(100), allowNull: false },
  codePostal: { type: DataTypes.STRING(10), allowNull: false },
  pays: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'Canada' },
  parDefaut: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'addresses' });

module.exports = Address;
