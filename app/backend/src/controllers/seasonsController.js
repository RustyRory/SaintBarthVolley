import Season from '../models/Season.js';

// Créer une nouvelle saison
export const createSeason = async (req, res) => {
  try {
    const season = new Season(req.body);
    await season.save();
    res.status(201).json({ message: 'Saison créée', season });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Récupérer toutes les saisons
export const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.find().sort({ startDate: -1 });
    res.json(seasons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Récupérer une saison par ID
export const getSeasonById = async (req, res) => {
  try {
    const season = await Season.findById(req.params.id);
    if (!season) return res.status(404).json({ message: 'Saison non trouvée' });
    res.json(season);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mettre à jour une saison
export const updateSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!season) return res.status(404).json({ message: 'Saison non trouvée' });
    res.json({ message: 'Saison mise à jour', season });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer une saison
export const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) return res.status(404).json({ message: 'Saison non trouvée' });
    res.json({ message: 'Saison supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
