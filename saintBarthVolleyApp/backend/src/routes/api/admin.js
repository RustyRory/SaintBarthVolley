import express from 'express';
import crypto from 'crypto';
import User from '../../models/User.js';
import sendEmail from '../../lib/sendEmail.js';
import { authMiddleware, requireRole } from '../../middlewares/authMiddleware.js';

const router = express.Router();
const adminOnly = [authMiddleware, requireRole('admin')];

// ─── Liste ───────────────────────────────────────────────────────────────────

router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ─── Créer un utilisateur (admin bypass — directement vérifié) ────────────────

router.post('/users', ...adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, isActive } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = new User({
      firstName,
      lastName,
      email,
      role: role ?? 'user',
      isActive: isActive ?? true,
      isVerified: true, // l'admin crée directement un compte actif
    });
    await user.setPassword(password);
    await user.save();

    const { passwordHash: _, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) {
    console.error('CREATE USER ERROR:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ─── Modifier un utilisateur ──────────────────────────────────────────────────

router.patch('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive, isVerified } = req.body;
    const allowedRoles = ['admin', 'editor', 'user'];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) {
      user.isVerified = isVerified;
      if (isVerified) {
        user.verificationToken = null;
        user.verificationTokenExpires = null;
      }
    }

    await user.save();
    const { passwordHash: _, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    console.error('UPDATE USER ERROR:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ─── Renvoyer l'email de vérification ────────────────────────────────────────

router.post('/users/:id/resend-verification', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    if (user.isVerified) return res.status(400).json({ message: 'Compte déjà vérifié' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Activez votre compte — Saint-Barth Volley',
      html: `<p>Bonjour ${user.firstName},</p>
             <p>Cliquez sur ce lien pour activer votre compte (valable 24h) :</p>
             <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Activer mon compte</a>`,
    });

    res.json({ message: 'Email de vérification renvoyé' });
  } catch (err) {
    console.error('RESEND VERIFICATION ERROR:', err);
    res.status(500).json({ message: "Erreur lors de l'envoi" });
  }
});

// ─── Supprimer ────────────────────────────────────────────────────────────────

router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router;
