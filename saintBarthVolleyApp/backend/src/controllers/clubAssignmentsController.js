import ClubAssignment from '../models/ClubAssignment.js';

export const getClubAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;
    if (req.query.memberId) filter.memberId = req.query.memberId;
    if (req.query.role) filter.role = req.query.role;
    if (req.query.public === 'true') filter.isPublic = true;

    const assignments = await ClubAssignment.find(filter)
      .populate('memberId', 'firstName lastName bio userId')
      .populate('seasonId', 'name status')
      .sort({ displayOrder: 1, createdAt: 1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClubAssignmentById = async (req, res) => {
  try {
    const a = await ClubAssignment.findById(req.params.id)
      .populate('memberId', 'firstName lastName bio userId')
      .populate('seasonId', 'name status');
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createClubAssignment = async (req, res) => {
  try {
    const a = await ClubAssignment.create(req.body);
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateClubAssignment = async (req, res) => {
  try {
    const a = await ClubAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteClubAssignment = async (req, res) => {
  try {
    const a = await ClubAssignment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json({ message: 'Affectation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
