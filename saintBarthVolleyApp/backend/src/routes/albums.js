import express from 'express';
import { getAlbums, getAlbumById, createAlbum, updateAlbum, deleteAlbum } from '../controllers/albumController.js';

const router = express.Router();

// Routes CRUD
router.get('/', getAlbums);
router.get('/:id', getAlbumById);
router.post('/', createAlbum);
router.put('/:id', updateAlbum);
router.delete('/:id', deleteAlbum);

export default router;
