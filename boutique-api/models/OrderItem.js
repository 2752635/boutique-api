const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  quantite: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  prixUnitaire: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, { tableName: 'order_items' });

module.exports = OrderItem;
