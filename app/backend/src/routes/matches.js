import express from 'express';
import { getMatches, getMatchById, createMatch, updateMatch, deleteMatch } from '../controllers/matchesController.js';

const router = express.Router();

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', createMatch);
router.put('/:id', updateMatch);
router.delete('/:id', deleteMatch);

export default router;
