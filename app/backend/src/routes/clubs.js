import express from 'express';
import * as clubsController from '../controllers/clubsController.js';
const router = express.Router();

// Routes CRUD clubs
router.get('/', clubsController.getAllClubs);
router.get('/:id', clubsController.getClubById);
router.post('/', clubsController.createClub);
router.put('/:id', clubsController.updateClub);
router.delete('/:id', clubsController.deleteClub);

export default router;
