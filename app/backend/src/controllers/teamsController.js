import Team from '../models/Team.js';

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isArchived: false }).populate('seasonId').populate('coachIds');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('seasonId').populate('coachIds');

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const archiveTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json({ message: 'Équipe archivée', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Équipe non trouvée' });
    }

    res.json({ message: 'Équipe supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
