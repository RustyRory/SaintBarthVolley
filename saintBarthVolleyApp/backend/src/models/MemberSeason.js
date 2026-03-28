import mongoose from 'mongoose';

const memberSeasonSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },

    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },

    roles: [
      {
        type: String,
        enum: ['player', 'coach', 'staff', 'referee', 'volunteer', 'owner'],
      },
    ],

    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],

    position: String,
    height: Number,
    weight: Number,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

memberSeasonSchema.index({ memberId: 1, seasonId: 1 }, { unique: true });

export default mongoose.model('MemberSeason', memberSeasonSchema);
