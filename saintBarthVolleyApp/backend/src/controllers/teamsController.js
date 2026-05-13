// src/controllers/teamsController.js
import Team from '../models/Team.js';

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Team.findOne(query);
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
}

export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(id);
    const team = isObjectId ? await Team.findById(id) : await Team.findOne({ slug: id });
    if (!team) return res.status(404).json({ message: 'Équipe non trouvée' });
    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/teams?seasonId=xxx  OR  /api/seasons/:seasonId/teams
export const getTeamsBySeason = async (req, res) => {
  try {
    const seasonId = req.params.seasonId ?? req.query.seasonId;
    if (!seasonId) return res.status(400).json({ message: 'seasonId requis' });

    const filter = seasonId === 'all' ? {} : { seasonId };
    const teams = await Team.find(filter).sort({ name: 1 });
    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// POST /api/teams
export const createTeam = async (req, res) => {
  try {
    const { name, category, gender, level, seasonId } = req.body;

    if (!name || !category || !gender || !seasonId) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const slug = await uniqueSlug(generateSlug(name));
    const newTeam = new Team({ name, slug, category, gender, level, seasonId });
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

    const slug = await uniqueSlug(generateSlug(name));
    const newTeam = new Team({ name, slug, category, gender, level, seasonId });
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// PUT /api/teams/:id
export const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.name) {
      update.slug = await uniqueSlug(generateSlug(update.name), id);
    }
    const updated = await Team.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Équipe introuvable' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// DELETE /api/teams/:id
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
