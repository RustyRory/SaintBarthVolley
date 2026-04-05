import mongoose from 'mongoose';

const standingSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    teamName: {
      type: String,
      required: true,
      trim: true,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    played: {
      type: Number,
      required: true,
      min: 0,
    },
    wins: {
      type: Number,
      required: true,
      min: 0,
    },
    losses: {
      type: Number,
      required: true,
      min: 0,
    },
    setsFor: {
      type: Number,
      required: true,
      min: 0,
    },
    setsAgainst: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Standing', standingSchema);
