import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware d'authentification
 * Vérifie le token JWT et attache l'utilisateur à req.user
 */
export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Header Authorization
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2️⃣ Cookie httpOnly
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ message: 'Token manquant' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' });
    if (!user.isActive) return res.status(403).json({ message: 'Compte désactivé' });

    req.user = user;
    next();
  } catch (err) {
    console.error('AUTH MIDDLEWARE ERROR:', err);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

/**
 * Middleware de rôle
 * @param {...string} roles autorisés
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    next();
  };
};
