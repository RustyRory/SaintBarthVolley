import express from 'express';
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deactivateMember,
  deleteMember,
} from '../controllers/membersController.js';

const router = express.Router();

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.patch('/:id/deactivate', deactivateMember);
router.delete('/:id', deleteMember);

export default router;
