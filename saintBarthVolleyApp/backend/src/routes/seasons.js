// src/routes/seasons.js
import express from 'express';
import {
  createSeason,
  getSeasons,
  getSeasonById,
  updateSeason,
  deleteSeason,
} from '../controllers/seasonsController.js';
import { getTeamsBySeason, createTeamForSeason } from '../controllers/teamsController.js';

const router = express.Router();

// 🔹 CRUD saisons
router.get('/', getSeasons);
router.get('/:id', getSeasonById);
// 🔹 Liste des équipes d'une saison (compatible frontend actuel)
router.get('/:seasonId/teams', getTeamsBySeason);
router.post('/', createSeason);
// Créer une équipe pour cette saison
router.post('/:id/teams', createTeamForSeason);
router.put('/:id', updateSeason);
router.delete('/:id', deleteSeason);

export default router;
