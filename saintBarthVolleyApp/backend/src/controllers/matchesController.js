import Match from '../models/Match.js';

// Liste des matchs (par championnat)
export const getMatches = async (req, res) => {
  try {
    const filter = {};

    if (req.query.championshipId) {
      filter.championshipId = req.query.championshipId;
    }

    const matches = await Match.find(filter).populate('championshipId').sort({ date: 1 });

    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Match par ID
export const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate('championshipId');

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Création (import FFVB ou manuel)
export const createMatch = async (req, res) => {
  try {
    const match = await Match.create(req.body);
    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mise à jour (score, statut, etc.)
export const updateMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    res.json(match);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Suppression
export const deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    res.json({ message: 'Match supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
