import Team from '../models/Team.js';
import MemberSeason from '../models/MemberSeason.js';

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isArchived: false }).populate('seasonId');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('seasonId');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
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
      runValidators: true,
    });

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
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
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team archived', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamMembers = async (req, res) => {
  try {
    const teamId = req.params.id;

    const members = await MemberSeason.find({
      teams: teamId,
      isActive: true,
    })
      .populate({
        path: 'memberId',
        select: 'firstName lastName photo',
      })
      .populate({
        path: 'seasonId',
        select: 'name',
      });

    members.sort((a, b) => a.memberId.lastName.localeCompare(b.memberId.lastName));
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
