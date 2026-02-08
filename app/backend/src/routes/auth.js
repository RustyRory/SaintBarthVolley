import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

/**
 * POST /auth/register
 * Inscription utilisateur (compte en attente de validation admin)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérification basique
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    // Email déjà utilisé ?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    // Création user (isActive = false par défaut)
    const user = new User({
      email,
      firstName,
      lastName,
      role: 'user',
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json({
      message: 'Compte créé. En attente de validation par un administrateur.',
    });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * POST /auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email ou mot de passe manquant' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Compte non validé par l’admin
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Compte non activé. Contactez un administrateur.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Mise à jour last login
    user.lastLoginAt = new Date();
    await user.save();

    // Génération JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
