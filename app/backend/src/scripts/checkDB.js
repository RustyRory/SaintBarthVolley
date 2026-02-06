import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connecté à MongoDB :', process.env.MONGO_URI))
  .catch((err) => console.error('❌ Erreur connexion MongoDB :', err))
  .finally(() => mongoose.disconnect());
