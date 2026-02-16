import express from 'express';
import {
  createSeason,
  getSeasons,
  getSeasonById,
  updateSeason,
  deleteSeason,
} from '../controllers/seasonsController.js';

const router = express.Router();

// CRUD seasons
router.get('/', getSeasons);
router.get('/:id', getSeasonById);
router.post('/', createSeason);
router.put('/:id', updateSeason);
router.delete('/:id', deleteSeason);

export default router;
