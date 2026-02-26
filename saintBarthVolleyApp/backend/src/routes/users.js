import express from 'express';
import * as usersController from '../controllers/usersController.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔹 Toutes les routes sont protégées
router.use(authMiddleware);

// GET /api/users => liste tous les utilisateurs (admin uniquement)
router.get('/', requireRole('admin'), usersController.getAllUsers);

// GET /api/users/:id => voir un utilisateur (admin/éditeur)
router.get('/:id', requireRole('admin', 'editor'), usersController.getUserById);

// POST /api/users => créer un utilisateur (admin uniquement)
router.post('/', requireRole('admin'), usersController.createUser);

// PUT /api/users/:id => modifier un utilisateur (admin uniquement)
router.put('/:id', requireRole('admin'), usersController.updateUser);

// DELETE /api/users/:id => supprimer un utilisateur (admin uniquement)
router.delete('/:id', requireRole('admin'), usersController.deleteUser);

export default router;
