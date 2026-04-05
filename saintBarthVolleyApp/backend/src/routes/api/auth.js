import express from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from '../../controllers/authController.js';

import { authMiddleware } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// 🔐 AUTH

// POST /api/auth/register
router.post('/register', register);

// GET /api/auth/verify-email?token=...
router.get('/verify-email', verifyEmail);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

// 👤 USER CONNECTÉ
router.get('/me', authMiddleware, (req, res) => {
  try {
    res.json({
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      createdAt: req.user.createdAt,
      isVerified: req.user.isVerified,
      isActive: req.user.isActive,
    });
  } catch (error) {
    console.error('AUTH ME ERROR:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
