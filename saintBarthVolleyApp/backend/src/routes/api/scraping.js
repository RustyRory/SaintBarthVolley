// src/routes/api/scraping.js
import express from 'express';
import { runScraping } from '../../services/scrapingService.js';
import Match from '../../models/Match.js';

const router = express.Router();

// POST /api/scraping/run
// Déclenche le scraping FFVB et retourne un résumé
router.post('/run', async (req, res) => {
  const logs = [];
  const onLog = (msg) => {
    logs.push(msg);
    console.log(msg);
  };

  try {
    // Purger les matches parasites déjà en base (divisions et journées exemptées)
    const divisionPattern =
      /^(nationale|régionale?|régional|poule|division|phase|honneur|excellence|fédérale|pro\s?[ab]?)\s*\d*$/i;
    const byePattern = /^(x+|exempt[e]?|bye|-+)$/i;
    const allMatches = await Match.find({}, 'opponentName');
    const parasiteIds = allMatches
      .filter((m) => {
        const name = m.opponentName?.trim() ?? '';
        return divisionPattern.test(name) || byePattern.test(name);
      })
      .map((m) => m._id);
    if (parasiteIds.length > 0) {
      await Match.deleteMany({ _id: { $in: parasiteIds } });
      onLog(`🗑️  ${parasiteIds.length} match(es) parasite(s) supprimé(s) de la base`);
    }

    const results = await runScraping(onLog);

    const totalCreated = results.reduce((acc, r) => acc + (r.matchesCreated || 0), 0);
    const totalUpdated = results.reduce((acc, r) => acc + (r.matchesUpdated || 0), 0);
    const totalStandings = results.reduce((acc, r) => acc + (r.standings || 0), 0);
    const errors = results.filter((r) => r.error).map((r) => r.error);

    res.json({
      success: true,
      championships: results.length,
      matchesCreated: totalCreated,
      matchesUpdated: totalUpdated,
      standings: totalStandings,
      errors,
      logs,
    });
  } catch (err) {
    console.error('Erreur scraping:', err);
    res.status(500).json({ success: false, message: err.message, logs });
  }
});

export default router;
