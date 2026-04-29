import express from 'express';
import {
  getTeamAssignments,
  getTeamAssignmentById,
  createTeamAssignment,
  updateTeamAssignment,
  deleteTeamAssignment,
} from '../controllers/teamAssignmentsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getTeamAssignments);
router.get('/:id', getTeamAssignmentById);
router.post('/', authMiddleware, createTeamAssignment);
router.put('/:id', authMiddleware, updateTeamAssignment);
router.delete('/:id', authMiddleware, deleteTeamAssignment);

export default router;
