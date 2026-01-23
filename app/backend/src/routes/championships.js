import express from 'express';
import {
  getChampionships,
  getChampionshipById,
  createChampionship,
  updateChampionship,
  deleteChampionship,
} from '../controllers/championshipsController.js';

const router = express.Router();

router.get('/', getChampionships);
router.get('/:id', getChampionshipById);
router.post('/', createChampionship);
router.put('/:id', updateChampionship);
router.delete('/:id', deleteChampionship);

export default router;
