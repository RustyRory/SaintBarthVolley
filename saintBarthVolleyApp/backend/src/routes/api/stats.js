// src/routes/api/stats.js
import express from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import User from '../../models/User.js';
import Member from '../../models/Member.js';
import Team from '../../models/Team.js';
import Match from '../../models/Match.js';
import Season from '../../models/Season.js';
import News from '../../models/News.js';
import Partner from '../../models/Partner.js';

const router = express.Router();

// GET /api/stats — chiffres clés pour le dashboard admin
router.get('/', authMiddleware, async (req, res) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      totalMembers,
      activeMembers,
      activeSeason,
      totalMatches,
      upcomingMatches,
      publishedNews,
      activePartners,
    ] = await Promise.all([
      User.countDocuments(),
      Member.countDocuments(),
      Member.countDocuments({ isActive: true }),
      Season.findOne({ status: 'active' }),
      Match.countDocuments(),
      Match.countDocuments({ status: 'scheduled', date: { $gte: now } }),
      News.countDocuments({ isPublished: true }),
      Partner.countDocuments({ isActive: true }),
    ]);

    // Équipes de la saison active (ou total)
    const teamsFilter = activeSeason ? { seasonId: activeSeason._id } : {};
    const totalTeams = await Team.countDocuments(teamsFilter);

    res.json({
      totalUsers,
      totalMembers,
      activeMembers,
      totalTeams,
      activeSeason: activeSeason ? activeSeason.name : null,
      totalMatches,
      upcomingMatches,
      publishedNews,
      activePartners,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
