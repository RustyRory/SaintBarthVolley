import express from 'express';
import {
  getCupPhases,
  getCupPhaseById,
  createCupPhase,
  updateCupPhase,
  deleteCupPhase,
} from '../controllers/cupPhasesController.js';

const router = express.Router();

router.get('/', getCupPhases);
router.get('/:id', getCupPhaseById);
router.post('/', createCupPhase);
router.put('/:id', updateCupPhase);
router.delete('/:id', deleteCupPhase);

export default router;
