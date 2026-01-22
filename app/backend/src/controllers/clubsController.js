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
    if (!club) return res.status(404).json({ message: 'Club not found' });
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
    res.status(201).json({ message: 'Club created', clubId: club._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT update club
export const updateClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    Object.assign(club, req.body); // Met à jour tous les champs reçus
    await club.save();
    res.json({ message: 'Club updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE club
export const deleteClub = async (req, res) => {
  try {
    const club = await Club.findByIdAndDelete(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
