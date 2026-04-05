// server.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './src/app.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley';

// Connexion MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Lancer le serveur
    app.listen(PORT, () => {
      console.log(`Server launched on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error('Error MongoDB:', err));
