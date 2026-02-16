import express from 'express';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  archiveTeam,
  deleteTeam,
} from '../controllers/teamsController.js';

const router = express.Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.patch('/:id/archive', archiveTeam);
router.delete('/:id', deleteTeam);

export default router;
