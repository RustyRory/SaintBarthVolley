import mongoose from 'mongoose';

const teamRoleSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, // optionnel : null = bénévole sans équipe
  seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
  roles: [
    {
      type: String,
      enum: ['player', 'coach', 'staff', 'referee', 'volunteer', 'owner'],
      default: 'player',
    },
  ],
  isCaptain: { type: Boolean, default: false },
  position: { type: String, trim: true },
  photo: { type: String, default: '' }, // photo propre à cette affectation (équipe ou saison)
}); // _id activé → chaque rôle a son propre ObjectId

const memberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    birthDate: { type: Date },
    height: Number,
    weight: Number,
    isActive: { type: Boolean, default: true },
    bio: { type: String },
    teamRoles: [teamRoleSchema],
  },
  { timestamps: true },
);

const Member = mongoose.model('Member', memberSchema);
export default Member;
