require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Role, User, Category, Product } = require('../models');

(async () => {
  await sequelize.sync();

  const [admin] = await Role.findOrCreate({ where: { nom: 'admin' }, defaults: { description: 'Administrateur' } });
  await Role.findOrCreate({ where: { nom: 'client' }, defaults: { description: 'Client de la boutique' } });

  await User.findOrCreate({
    where: { email: 'admin@boutique.com' },
    defaults: {
      nom: 'Admin', prenom: 'Super',
      motDePasse: await bcrypt.hash('Admin123!', 10), roleId: admin.id,
    },
  });

  const [info] = await Category.findOrCreate({ where: { nom: 'Informatique' }, defaults: { description: 'Ordinateurs et accessoires' } });
  await Product.findOrCreate({
    where: { nom: 'Clavier mécanique' },
    defaults: { description: 'Clavier RGB', prix: 79.99, stock: 25, categoryId: info.id },
  });

  console.log('Données initiales créées. Admin : admin@boutique.com / Admin123!');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
