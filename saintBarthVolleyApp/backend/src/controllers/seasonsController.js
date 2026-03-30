import Season from '../models/Season.js';
import MemberSeason from '../models/MemberSeason.js';

// Créer une nouvelle saison
export const createSeason = async (req, res) => {
  try {
    const season = new Season(req.body);
    await season.save();
    res.status(201).json({ message: 'Season created', season });
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
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json(season);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSeasonMembers = async (req, res) => {
  try {
    const seasonId = req.params.id;

    const members = await MemberSeason.find({
      seasonId,
      isActive: true,
    })
      .populate({
        path: 'memberId',
        select: 'firstName lastName photo',
      })
      .populate({
        path: 'teams',
        select: 'name category',
      });

    members.sort((a, b) => a.memberId.lastName.localeCompare(b.memberId.lastName));
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une saison
export const updateSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json({ message: 'Season updated', season });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer une saison
export const deleteSeason = async (req, res) => {
  try {
    const season = await Season.findByIdAndDelete(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });
    res.json({ message: 'Season deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
