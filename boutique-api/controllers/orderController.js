const { Order, OrderItem, Product, User, Address, sequelize } = require('../models');
const { getPagination, formatPage } = require('../utils/paginate');

const fullInclude = [
  { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'nom', 'image'] }] },
  { model: User, as: 'user', attributes: ['id', 'nom', 'prenom', 'email'] },
  { model: Address, as: 'address' },
];

// Un client voit ses commandes, l'admin voit tout
exports.getAll = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
    if (req.query.statut) where.statut = req.query.statut;
    const result = await Order.findAndCountAll({
      where, limit, offset, order: [['id', 'DESC']], include: fullInclude, distinct: true,
    });
    res.json(formatPage(result, page, limit));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: fullInclude });
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// body: { "addressId": 1, "items": [ { "productId": 1, "quantite": 2 }, ... ] }   (addressId optionnel)
exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { addressId } = req.body;
    if (addressId) {
      const address = await Address.findByPk(addressId, { transaction: t });
      if (!address || address.userId !== req.user.id) throw new Error('Adresse de livraison invalide');
    }
    let total = 0;
    const lignes = [];
    for (const it of req.body.items) {
      const product = await Product.findByPk(it.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!product) throw new Error(`Produit ${it.productId} introuvable`);
      if (product.stock < it.quantite) throw new Error(`Stock insuffisant pour "${product.nom}"`);
      product.stock -= it.quantite;
      await product.save({ transaction: t });
      total += Number(product.prix) * it.quantite;
      lignes.push({ productId: product.id, quantite: it.quantite, prixUnitaire: product.prix });
    }
    total = Math.round(total * 100) / 100;
    const order = await Order.create({ userId: req.user.id, addressId: addressId || null, total }, { transaction: t });
    await OrderItem.bulkCreate(lignes.map((l) => ({ ...l, orderId: order.id })), { transaction: t });
    await t.commit();
    res.status(201).json(await Order.findByPk(order.id, { include: fullInclude }));
  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
};

// Admin : changer le statut
exports.updateStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }], transaction: t });
    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Commande introuvable' }); }
    if (order.statut === 'annulee') {
      await t.rollback();
      return res.status(400).json({ message: 'Une commande annulée ne peut plus changer de statut' });
    }
    // si l'admin annule, on remet le stock
    if (req.body.statut === 'annulee') {
      for (const it of order.items) {
        await Product.increment({ stock: it.quantite }, { where: { id: it.productId }, transaction: t });
      }
    }
    await order.update({ statut: req.body.statut }, { transaction: t });
    await t.commit();
    res.json(order);
  } catch (err) { await t.rollback(); res.status(400).json({ message: err.message }); }
};

// Admin : supprimer une commande (remet le stock si elle n'était pas annulée)
exports.remove = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }], transaction: t });
    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Commande introuvable' }); }
    if (order.statut !== 'annulee') {
      for (const it of order.items) {
        await Product.increment({ stock: it.quantite }, { where: { id: it.productId }, transaction: t });
      }
    }
    await order.destroy({ transaction: t });
    await t.commit();
    res.json({ message: 'Commande supprimée' });
  } catch (err) { await t.rollback(); res.status(400).json({ message: err.message }); }
};

// Client : annuler sa propre commande en attente (remet le stock)
exports.cancel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, { include: [{ model: OrderItem, as: 'items' }], transaction: t });
    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Commande introuvable' }); }
    if (order.userId !== req.user.id) { await t.rollback(); return res.status(403).json({ message: 'Accès refusé' }); }
    if (order.statut !== 'en_attente') { await t.rollback(); return res.status(400).json({ message: 'Seule une commande en attente peut être annulée' }); }
    for (const it of order.items) {
      await Product.increment({ stock: it.quantite }, { where: { id: it.productId }, transaction: t });
    }
    await order.update({ statut: 'annulee' }, { transaction: t });
    await t.commit();
    res.json(order);
  } catch (err) { await t.rollback(); res.status(400).json({ message: err.message }); }
};
