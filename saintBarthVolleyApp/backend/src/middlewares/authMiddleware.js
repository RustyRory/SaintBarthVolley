import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware d'authentification
 * Vérifie le token JWT et attache l'utilisateur à req.user
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Vérification présence header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération utilisateur
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    // Compte désactivé
    if (!user.isActive) {
      return res.status(403).json({ message: 'Compte désactivé' });
    }

    // Injection user dans la requête
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
