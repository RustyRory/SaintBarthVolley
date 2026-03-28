import express from 'express';
import {
  getAllMemberSeasons,
  getMemberSeasonById,
  createMemberSeason,
  updateMemberSeason,
  deleteMemberSeason,
} from '../controllers/memberSeasonController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔹 Toutes les routes nécessitent admin
router.use(authMiddleware, requireRole('admin'));

router.get('/', getAllMemberSeasons);
router.get('/:id', getMemberSeasonById);
router.post('/', createMemberSeason);
router.put('/:id', updateMemberSeason);
router.delete('/:id', deleteMemberSeason);

export default router;
