import express from 'express';
import {
  getClubAssignments,
  getClubAssignmentById,
  createClubAssignment,
  updateClubAssignment,
  deleteClubAssignment,
} from '../controllers/clubAssignmentsController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getClubAssignments);
router.get('/:id', getClubAssignmentById);
router.post('/', authMiddleware, createClubAssignment);
router.put('/:id', authMiddleware, updateClubAssignment);
router.delete('/:id', authMiddleware, deleteClubAssignment);

export default router;
