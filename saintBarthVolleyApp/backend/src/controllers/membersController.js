import Member from '../models/Member.js';

// ─── CRUD membres ────────────────────────────────────────────────────────────

export const getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Gestion des rôles (teamRoles subdocs) ───────────────────────────────────
// Identifiés par leur propre _id (roleId), pas par teamId

// GET /api/members/:memberId/roles
export const getMemberRoles = async (req, res) => {
  try {
    const member = await Member.findById(req.params.memberId)
      .populate('teamRoles.teamId')
      .populate('teamRoles.seasonId');
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member.teamRoles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/members/:memberId/roles
export const addMemberRole = async (req, res) => {
  try {
    const { teamId, seasonId, roles, isCaptain, position, photo } = req.body;
    const member = await Member.findById(req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.teamRoles.push({ teamId: teamId || undefined, seasonId, roles, isCaptain, position, photo });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/members/:memberId/roles/:roleId
export const updateMemberRole = async (req, res) => {
  try {
    const { memberId, roleId } = req.params;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const role = member.teamRoles.id(roleId);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    const { roles, isCaptain, position, photo } = req.body;
    if (roles !== undefined) role.roles = roles;
    if (isCaptain !== undefined) role.isCaptain = isCaptain;
    if (position !== undefined) role.position = position;
    if (photo !== undefined) role.photo = photo;

    await member.save();
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/members/:memberId/roles/:roleId
export const removeMemberRole = async (req, res) => {
  try {
    const { memberId, roleId } = req.params;
    const member = await Member.findById(memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const role = member.teamRoles.id(roleId);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    role.deleteOne();
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
