import express from 'express';
import User from '../models/User.js';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * GET /admin/users
 * Liste tous les utilisateurs
 */
router.get('/users', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('GET USERS ERROR:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /admin/users/:id/activate
 * Activer / désactiver un compte utilisateur
 */
router.patch('/users/:id/activate', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `Compte ${isActive ? 'activé' : 'désactivé'}`,
    });
  } catch (error) {
    console.error('ACTIVATE USER ERROR:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * PATCH /admin/users/:id/role
 * Modifier le rôle d’un utilisateur
 */
router.patch('/users/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['admin', 'editor', 'user'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'Rôle mis à jour',
    });
  } catch (error) {
    console.error('UPDATE ROLE ERROR:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
