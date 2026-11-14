const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  statut: {
    type: DataTypes.ENUM('en_attente', 'payee', 'expediee', 'livree', 'annulee'),
    defaultValue: 'en_attente',
  },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
}, { tableName: 'orders' });

module.exports = Order;
