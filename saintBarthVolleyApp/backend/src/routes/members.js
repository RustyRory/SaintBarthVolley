import express from 'express';
import {
  getMembers,
  createMember,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberRoles,
  addMemberRole,
  updateMemberRole,
  removeMemberRole,
} from '../controllers/membersController.js';

const router = express.Router();

// CRUD membres
router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

// Gestion des rôles (identifiés par leur _id de subdoc)
router.get('/:memberId/roles', getMemberRoles);
router.post('/:memberId/roles', addMemberRole);
router.put('/:memberId/roles/:roleId', updateMemberRole);
router.delete('/:memberId/roles/:roleId', removeMemberRole);

export default router;
