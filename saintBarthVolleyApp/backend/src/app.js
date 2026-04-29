// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

// 🔹 Routes
import usersRoutes from './routes/users.js';
import clubsRoutes from './routes/clubs.js';
import seasonsRoutes from './routes/seasons.js';
import teamsRoutes from './routes/teams.js';
import membersRoutes from './routes/members.js';
import membersWithSeasonRoute from './routes/api/membersWithSeason.js';
import authRoutes from './routes/api/auth.js';
import adminRoutes from './routes/api/admin.js';
import uploadRoutes from './routes/api/upload.js';
import scrapingRoutes from './routes/api/scraping.js';
import statsRoutes from './routes/api/stats.js';

// Autres routes (optionnel)
import newsRoutes from './routes/news.js';
import albumsRoutes from './routes/albums.js';
import mediasRoutes from './routes/medias.js';
import partnersRoutes from './routes/partners.js';
import standingsRoutes from './routes/standings.js';
import matchesRoutes from './routes/matches.js';
import championshipsRoutes from './routes/championships.js';
import eventsRoutes from './routes/events.js';
import clubAssignmentsRoutes from './routes/clubAssignments.js';
import teamAssignmentsRoutes from './routes/teamAssignments.js';
import cupPhasesRoutes from './routes/cupPhases.js';

dotenv.config();
const app = express();

// 🔹 Middlewares globaux
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 CORS pour Next.js
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: (origin, cb) => {
      // Autoriser les requêtes sans origin (ex: curl, Postman) et les origins autorisées
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS bloqué: ${origin}`));
    },
    credentials: true,
  }),
);

// 🔹 Statique pour uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// 🔹 Route test
app.get('/', (req, res) => res.send('API Volley fonctionne !'));

// 🔹 Routes API principales
app.use('/api/users', usersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/seasons', seasonsRoutes); // CRUD saisons
app.use('/api/teams', teamsRoutes); // CRUD équipes
app.use('/api/members', membersRoutes); // CRUD membres
app.use('/api/members-with-season', membersWithSeasonRoute); // Membres + saison active

// 🔹 Routes admin/auth/upload
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/scraping', scrapingRoutes);
app.use('/api/stats', statsRoutes);

// 🔹 Routes optionnelles
app.use('/api/news', newsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/medias', mediasRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/championships', championshipsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/club-assignments', clubAssignmentsRoutes);
app.use('/api/team-assignments', teamAssignmentsRoutes);
app.use('/api/cup-phases', cupPhasesRoutes);

// 🔹 Export
export default app;
