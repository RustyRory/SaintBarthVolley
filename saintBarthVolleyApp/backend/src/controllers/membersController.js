import Member from '../models/Member.js';
import MemberSeason from '../models/MemberSeason.js';

export const getMembers = async (req, res) => {
  try {
    const members = await Member.find({ isActive: true });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const memberSeasons = await MemberSeason.find({
      memberId: member._id,
    })
      .populate('seasonId')
      .populate('teams');

    res.json({
      member,
      seasons: memberSeasons,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deactivateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deactivated', member });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
