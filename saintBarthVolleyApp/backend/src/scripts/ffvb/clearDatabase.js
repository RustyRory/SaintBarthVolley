import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from '../../models/Match.js';
import Standing from '../../models/Standing.js';

dotenv.config();

async function clearDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saintbarthvolley');
    console.log('✅ Connecté à MongoDB');

    const deletedMatches = await Match.deleteMany({});
    console.log(`🗑️  ${deletedMatches.deletedCount} matchs supprimés`);

    const deletedStandings = await Standing.deleteMany({});
    console.log(`🗑️  ${deletedStandings.deletedCount} standings supprimés`);

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (err) {
    console.error('❌ Erreur lors de la suppression :', err);
  }
}

clearDB();
