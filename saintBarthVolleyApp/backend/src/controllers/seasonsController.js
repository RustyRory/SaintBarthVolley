import Season from '../models/Season.js';
import Member from '../models/Member.js';

// Liste toutes les saisons triées par startDate
export const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: 1 });
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Créer saison
export const createSeason = async (req, res) => {
  try {
    const season = new Season(req.body);
    await season.save();
    res.status(201).json(season);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Récupérer saison par ID
export const getSeasonById = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json(season);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier saison
export const updateSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json(season);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer saison
export const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json({ message: 'Season deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
