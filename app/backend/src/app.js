// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Création de l'application Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Pour parser le corps des requêtes en JSON

// Route par défaut pour tester l'API
app.get('/', (req, res) => {
  res.send('API Volley fonctionne !');
});

// Importer les routes existantes
import usersRoutes from './routes/users.js';
import clubsRoutes from './routes/clubs.js';
import seasonsRoutes from './routes/seasons.js';
import teamsRoutes from './routes/teams.js';
import membersRoutes from './routes/members.js';
import newsRoutes from './routes/news.js';
import albumsRoutes from './routes/albums.js';
import mediasRoutes from './routes/medias.js';
import partnersRoutes from './routes/partners.js';
import championshipsRoutes from './routes/championships.js';
import standingsRoutes from './routes/standings.js';
import matchesRoutes from './routes/matches.js';

// Utiliser les routes existantes
app.use('/api/users', usersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/medias', mediasRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/championships', championshipsRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/matches', matchesRoutes);

// 🔹 Nouveaux endpoints pour récupérer les matchs
import Match from './models/Match.js';
// 🔹 Endpoints pour les matchs

/**
 * GET /api/matches
 * - Optionnel : ?club=NomClub
 */
app.get('/api/matches', async (req, res) => {
  try {
    const { club } = req.query;
    let filter = {};

    if (club) {
      filter = { $or: [{ opponentName: decodeURIComponent(club) }] };
    }

    const matches = await Match.find(filter)
      .populate('championshipId') // si tu veux récupérer les infos du championnat
      .sort({ date: 1 });

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
