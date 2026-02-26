// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

// Création de l'application Express
const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());

// Middlewares
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);
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
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';

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
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// 🔹 Nouveaux endpoints pour récupérer les matchs
import Match from './models/Match.js';
import Standing from './models/Standing.js';

// 🔹 Endpoint pour récupérer les matchs
/**
 * GET /api/matches
 * - Optionnel :
 *    ?club=NomClub
 *    ?championshipId=<ID>
 */
app.get('/api/matches', async (req, res) => {
  try {
    const { club, championshipId } = req.query;
    let filter = {};

    if (club) {
      // Filtrer sur le nom de l'adversaire
      filter.opponentName = decodeURIComponent(club);
    }

    if (championshipId) {
      filter.championshipId = championshipId;
    }

    // Récupérer tous les matchs correspondants
    const matches = await Match.find(filter)
      .populate('championshipId') // pour récupérer les infos du championnat
      .sort({ date: 1 }) // tri par date croissante
      .lean(); // JSON simple, sans méthodes Mongoose

    // Formater chaque match pour le front
    const formatted = matches.map((m) => ({
      id: m._id,
      championshipId: m.championshipId?._id || null,
      championshipName: m.championshipId?.name || '',
      date: m.date,
      homeAway: m.homeAway,
      opponentName: m.opponentName,
      status: m.status,
      scoreFor: m.scoreFor,
      scoreAgainst: m.scoreAgainst,
      setsDetail: m.setsDetail || [],
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Endpoint pour récupérer tous les standings
/**
 * GET /api/standings
 * - Optionnel : ?championshipId=<ID>
 */
app.get('/api/standings', async (req, res) => {
  try {
    const { championshipId } = req.query;
    let filter = {};

    // Si un championnat est précisé, on filtre dessus
    if (championshipId) {
      filter.championshipId = championshipId;
    }

    // Récupère tous les standings correspondants
    const standings = await Standing.find(filter)
      .sort({ rank: 1 }) // tri par classement
      .lean(); // pour renvoyer un simple JSON sans les méthodes Mongoose

    res.json(standings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default app;
