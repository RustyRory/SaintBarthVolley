import Championship from '../models/Championship.js';

// Liste (optionnellement filtrée par saison ou équipe)
export const getChampionships = async (req, res) => {
  try {
    const filter = {};

    if (req.query.seasonId) {
      filter.seasonId = req.query.seasonId;
    }

    if (req.query.teamId) {
      filter.teamId = req.query.teamId;
    }

    const championships = await Championship.find(filter).populate('teamId').sort({ createdAt: -1 });

    res.json(championships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Par ID
export const getChampionshipById = async (req, res) => {
  try {
    const championship = await Championship.findById(req.params.id).populate('teamId');

    if (!championship) {
      return res.status(404).json({ message: 'Championship not found' });
    }

    res.json(championship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Création
export const createChampionship = async (req, res) => {
  try {
    const championship = await Championship.create(req.body);
    res.status(201).json(championship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mise à jour
export const updateChampionship = async (req, res) => {
  try {
    const championship = await Championship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!championship) {
      return res.status(404).json({ message: 'Championship not found' });
    }

    res.json(championship);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Suppression
export const deleteChampionship = async (req, res) => {
  try {
    const championship = await Championship.findByIdAndDelete(req.params.id);

    if (!championship) {
      return res.status(404).json({ message: 'Championship not found' });
    }

    res.json({ message: 'Championship deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
