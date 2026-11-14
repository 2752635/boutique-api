require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { sequelize } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.json({ message: 'API Boutique en ligne - OK' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));

// 404
app.use((req, res) => res.status(404).json({ message: 'Route introuvable' }));

// Gestion globale des erreurs (dont Multer)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('images')) {
    return res.status(400).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3000;

// sync() crée les tables manquantes. Pas de { alter: true } à chaque démarrage :
// avec MySQL, ça duplique l'index unique de email à chaque redémarrage (erreur "Too many keys").
sequelize.sync()
  .then(() => app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`)))
  .catch((err) => console.error('Erreur de connexion à la base :', err.message));
