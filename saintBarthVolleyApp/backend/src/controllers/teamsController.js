// src/controllers/teamsController.js
import Team from '../models/Team.js'; // ton modèle Mongoose pour Team

// 🔹 Récupérer une équipe par son ID
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Équipe non trouvée' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 GET /api/teams?seasonId=xxx  OR  /api/seasons/:seasonId/teams
export const getTeamsBySeason = async (req, res) => {
  try {
    const seasonId = req.params.seasonId ?? req.query.seasonId;
    if (!seasonId) return res.status(400).json({ message: 'seasonId requis' });

    const teams = await Team.find({ seasonId });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 POST /api/teams
export const createTeam = async (req, res) => {
  try {
    const { name, category, gender, level, seasonId } = req.body;

    if (!name || !category || !gender || !seasonId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const newTeam = new Team({ name, category, gender, level, seasonId });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createTeamForSeason = async (req, res) => {
  try {
    const { id: seasonId } = req.params;
    const { name, category, gender, level } = req.body;

    if (!name || !category || !gender) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const newTeam = new Team({ name, category, gender, level, seasonId });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 PUT /api/teams/:id
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Team.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Équipe introuvable' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// 🔹 DELETE /api/teams/:id
export const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Équipe introuvable' });
    res.json({ message: 'Équipe supprimée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
