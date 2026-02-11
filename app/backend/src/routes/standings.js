import express from 'express';
import {
  getStandings,
  getStandingById,
  createStanding,
  updateStanding,
  deleteStanding,
} from '../controllers/standingsController.js';

const router = express.Router();

router.get('/', getStandings);
router.get('/:id', getStandingById);
router.post('/', createStanding);
router.put('/:id', updateStanding);
router.delete('/:id', deleteStanding);

export default router;
