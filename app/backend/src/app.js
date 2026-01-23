import express from 'express';
import cors from 'cors';
// Création de l'application Express
const app = express();
// Middlewares
app.use(cors());
// Pour parser le corps des requêtes en JSON
app.use(express.json());

// Route par défaut pour tester l'API
app.get('/', (req, res) => {
  res.send('API Volley fonctionne !');
});

// Importer les routes
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

// Utiliser les routes
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

// Exporter l'application
export default app;
