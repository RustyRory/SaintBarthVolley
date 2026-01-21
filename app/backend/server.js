import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley';

// Connexion à MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connecté');

    // Lancer le serveur
    app.listen(PORT, () => {
      console.log(`Serveur lancé sur http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('Erreur MongoDB:', err));
