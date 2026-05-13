// src/routes/teams.js
import express from 'express';
import Team from '../models/Team.js';
import {
  getTeamById,
  getTeamsBySeason,
  createTeam,
  createTeamForSeason,
  updateTeam,
  deleteTeam,
} from '../controllers/teamsController.js';

const router = express.Router();

// 🔹 Récupérer toutes les équipes pour une saison (query param ou saison spécifique)
router.get('/', async (req, res) => {
  try {
    const { seasonId } = req.query;
    if (!seasonId) return res.status(400).json({ message: 'seasonId requis' });
    const filter = seasonId === 'all' ? {} : { seasonId };
    const teams = await Team.find(filter).sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔹 Récupérer une équipe par son ID
router.get('/:id', getTeamById);

// 🔹 Créer une équipe "indépendante"
router.post('/', createTeam);

// 🔹 Créer une équipe pour une saison spécifique
router.post('/seasons/:seasonId/teams', createTeamForSeason);

// 🔹 Mettre à jour une équipe
router.put('/:id', updateTeam);

// 🔹 Supprimer une équipe
router.delete('/:id', deleteTeam);

export default router;
