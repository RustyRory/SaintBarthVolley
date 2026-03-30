// src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

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
import uploadRoutes from './routes/upload.js';
import memberSeasonsRouter from './routes/memberSeasons.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 CORS : autoriser Next.js front sur localhost:3000
app.use(
  cors({
    origin: 'http://localhost:3000', // Next.js
    credentials: true,
  }),
);

// Route test
app.get('/', (req, res) => res.send('API Volley fonctionne !'));

app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Routes API
app.use('/api/users', usersRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/member-seasons', memberSeasonsRouter);
app.use('/api/news', newsRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/medias', mediasRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/championships', championshipsRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

export default app;
