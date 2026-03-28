import MemberSeason from '../models/MemberSeason.js';

// 🔹 GET all member-seasons
export const getAllMemberSeasons = async (req, res) => {
  try {
    const memberSeasons = await MemberSeason.find().populate('memberId').populate('teams').populate('seasonId');
    res.json(memberSeasons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// 🔹 GET single member-season by ID
export const getMemberSeasonById = async (req, res) => {
  try {
    const memberSeason = await MemberSeason.findById(req.params.id)
      .populate('memberId')
      .populate('teams')
      .populate('seasonId');
    if (!memberSeason) return res.status(404).json({ message: 'Non trouvé' });
    res.json(memberSeason);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// 🔹 POST create member-season
export const createMemberSeason = async (req, res) => {
  try {
    const newMemberSeason = new MemberSeason(req.body);
    await newMemberSeason.save();
    res.status(201).json(newMemberSeason);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Erreur création', error: err.message });
  }
};

// 🔹 PUT update member-season
export const updateMemberSeason = async (req, res) => {
  try {
    const memberSeason = await MemberSeason.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!memberSeason) return res.status(404).json({ message: 'Non trouvé' });
    res.json(memberSeason);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Erreur update', error: err.message });
  }
};

// 🔹 DELETE member-season
export const deleteMemberSeason = async (req, res) => {
  try {
    const memberSeason = await MemberSeason.findByIdAndDelete(req.params.id);
    if (!memberSeason) return res.status(404).json({ message: 'Non trouvé' });
    res.json({ message: 'Supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
