const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Address = require('./Address');

// Role 1 - N User
// RESTRICT : on ne peut pas supprimer un rôle encore utilisé (sinon CASCADE supprimerait les utilisateurs)
Role.hasMany(User, { foreignKey: { name: 'roleId', allowNull: false }, as: 'users', onDelete: 'RESTRICT' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// Category 1 - N Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// User 1 - N Order
// RESTRICT : on garde l'historique des commandes
User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: false }, as: 'orders', onDelete: 'RESTRICT' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order 1 - N OrderItem, Product 1 - N OrderItem  (=> Order N - N Product)
Order.hasMany(OrderItem, { foreignKey: { name: 'orderId', allowNull: false }, as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
// RESTRICT : un produit déjà commandé ne peut pas être supprimé (sinon les commandes perdent leurs lignes)
Product.hasMany(OrderItem, { foreignKey: { name: 'productId', allowNull: false }, as: 'orderItems', onDelete: 'RESTRICT' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User 1 - N Review, Product 1 - N Review
User.hasMany(Review, { foreignKey: { name: 'userId', allowNull: false }, as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Review, { foreignKey: { name: 'productId', allowNull: false }, as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User 1 - N Address
User.hasMany(Address, { foreignKey: { name: 'userId', allowNull: false }, as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Address 1 - N Order (adresse de livraison, optionnelle)
Address.hasMany(Order, { foreignKey: { name: 'addressId', allowNull: true }, as: 'orders', onDelete: 'SET NULL' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });

module.exports = { sequelize, Role, User, Category, Product, Order, OrderItem, Review, Address };
