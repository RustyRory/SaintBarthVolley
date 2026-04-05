import Standing from '../models/Standing.js';

// Liste des classements (par équipe)
export const getStandings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.teamId) {
      filter.teamId = req.query.teamId;
    }

    const standings = await Standing.find(filter).populate('teamId').sort({ rank: 1 });

    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Classement par ID
export const getStandingById = async (req, res) => {
  try {
    const standing = await Standing.findById(req.params.id).populate('teamId');

    if (!standing) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    res.json(standing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Création
export const createStanding = async (req, res) => {
  try {
    const standing = await Standing.create(req.body);
    res.status(201).json(standing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mise à jour
export const updateStanding = async (req, res) => {
  try {
    const standing = await Standing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!standing) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    res.json(standing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Suppression
export const deleteStanding = async (req, res) => {
  try {
    const standing = await Standing.findByIdAndDelete(req.params.id);

    if (!standing) {
      return res.status(404).json({ message: 'Standing not found' });
    }

    res.json({ message: 'Standing deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
