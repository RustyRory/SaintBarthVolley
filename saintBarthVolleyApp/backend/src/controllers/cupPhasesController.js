import CupPhase from '../models/CupPhase.js';

export const getCupPhases = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;

    const phases = await CupPhase.find(filter)
      .populate('teamId', 'name')
      .populate('seasonId', 'name status')
      .sort({ createdAt: 1 });

    res.json(phases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCupPhaseById = async (req, res) => {
  try {
    const phase = await CupPhase.findById(req.params.id).populate('teamId', 'name').populate('seasonId', 'name status');
    if (!phase) return res.status(404).json({ message: 'Phase de coupe non trouvée' });
    res.json(phase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCupPhase = async (req, res) => {
  try {
    const phase = await CupPhase.create(req.body);
    res.status(201).json(phase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCupPhase = async (req, res) => {
  try {
    const phase = await CupPhase.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!phase) return res.status(404).json({ message: 'Phase de coupe non trouvée' });
    res.json(phase);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCupPhase = async (req, res) => {
  try {
    const phase = await CupPhase.findByIdAndDelete(req.params.id);
    if (!phase) return res.status(404).json({ message: 'Phase de coupe non trouvée' });
    res.json({ message: 'Phase supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
