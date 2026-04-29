import express from 'express';
import merge from 'lodash.merge';
import fs from 'fs';
import path from 'path';
import { getAllClubs, getClubById, createClub, deleteClub } from '../controllers/clubsController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';
import Club from '../models/Club.js';

const router = express.Router();

// 🔹 util pour supprimer ancienne image
const deleteOldFile = (url) => {
  if (!url) return;

  // ignore images par défaut
  if (url.includes('/assets/')) return;

  const filename = url.split('/uploads/')[1];
  if (!filename) return;

  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// 🔹 GET public club info (no auth required)
router.get('/public', async (req, res) => {
  try {
    const club = await Club.findOne().select('-legal_info -__v');
    if (!club) return res.status(404).json({ message: 'Club non trouvé' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 GET all clubs
router.get('/', authMiddleware, requireRole('admin'), getAllClubs);

// 🔹 GET single club
router.get('/:id', authMiddleware, requireRole('admin'), getClubById);

// 🔹 POST
router.post('/', authMiddleware, requireRole('admin'), createClub);

// 🔹 PUT update club
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club non trouvé' });

    // 🔹 gérer images AVANT merge
    if (req.body.logo && req.body.logo !== club.logo) {
      deleteOldFile(club.logo);
      club.logo = req.body.logo;
    }

    if (req.body.photo && req.body.photo !== club.photo) {
      deleteOldFile(club.photo);
      club.photo = req.body.photo;
    }

    // 🔹 retirer les champs image du merge
    const { logo, photo, ...rest } = req.body;

    merge(club, rest);

    await club.save();

    res.json({ message: 'Club mis à jour avec succès', club });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔹 DELETE
router.delete('/:id', authMiddleware, requireRole('admin'), deleteClub);

export default router;
