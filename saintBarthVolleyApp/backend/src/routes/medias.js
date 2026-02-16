import express from 'express';
import { getMedias, getMediaById, createMedia, updateMedia, deleteMedia } from '../controllers/mediasController.js';

const router = express.Router();

router.get('/', getMedias);
router.get('/:id', getMediaById);
router.post('/', createMedia);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);

export default router;
