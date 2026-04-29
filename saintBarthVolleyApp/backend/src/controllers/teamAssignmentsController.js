import TeamAssignment from '../models/TeamAssignment.js';

export const getTeamAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.teamId) filter.teamId = req.query.teamId;
    if (req.query.seasonId) filter.seasonId = req.query.seasonId;
    if (req.query.memberId) filter.memberId = req.query.memberId;
    if (req.query.role) filter.role = req.query.role;

    const assignments = await TeamAssignment.find(filter)
      .populate('memberId', 'firstName lastName bio userId')
      .populate('teamId', 'name category gender level')
      .populate('seasonId', 'name status')
      .sort({ role: 1, jerseyNumber: 1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeamAssignmentById = async (req, res) => {
  try {
    const a = await TeamAssignment.findById(req.params.id)
      .populate('memberId', 'firstName lastName bio userId')
      .populate('teamId', 'name category gender level')
      .populate('seasonId', 'name status');
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json(a);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTeamAssignment = async (req, res) => {
  try {
    const a = await TeamAssignment.create(req.body);
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTeamAssignment = async (req, res) => {
  try {
    const a = await TeamAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTeamAssignment = async (req, res) => {
  try {
    const a = await TeamAssignment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Affectation non trouvée' });
    res.json({ message: 'Affectation supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
