import express from 'express';
import { getNews, getNewsById, createNews, updateNews, deleteNews } from '../controllers/newsController.js';

const router = express.Router();

// CRUD news
router.get('/', getNews);
router.get('/:id', getNewsById);
router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router;
