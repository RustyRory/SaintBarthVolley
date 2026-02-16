import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ Connecté à MongoDB');

    // Vérifier s'il existe déjà un admin
    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('⚠️ Un admin existe déjà :', existingAdmin.email);
      process.exit(0);
    }

    // Création de l'admin
    const admin = new User({
      email: process.env.ADMIN_EMAIL,
      firstName: 'Admin',
      lastName: 'Root',
      role: 'admin',
      isActive: true,
    });

    await admin.setPassword(process.env.ADMIN_PASSWORD);

    await admin.save();

    console.log('🎉 Admin créé avec succès');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', process.env.ADMIN_PASSWORD);

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur seed admin:', err);
    process.exit(1);
  }
};

seedAdmin();
