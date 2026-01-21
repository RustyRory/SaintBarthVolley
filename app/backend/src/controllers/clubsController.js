import Club from '../models/Club.js';

// GET all clubs
export const getAllClubs = async (req, res) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single club
export const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club non trouvé' });
    res.json(club);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create club
export const createClub = async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.status(201).json({ message: 'Club créé', clubId: club._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update club
export const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club non trouvé' });

    Object.assign(club, req.body); // Met à jour tous les champs reçus
    await club.save();
    res.json({ message: 'Club mis à jour' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE club
export const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club non trouvé' });
    res.json({ message: 'Club supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
