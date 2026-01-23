import mongoose from 'mongoose';

const setDetailSchema = new mongoose.Schema(
  {
    setNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    scoreFor: {
      type: Number,
      required: true,
      min: 0,
    },
    scoreAgainst: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const matchSchema = new mongoose.Schema(
  {
    championshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChampionshipFFVB',
      required: true,
    },
    opponentName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    homeAway: {
      type: String,
      enum: ['home', 'away'],
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'played'],
      default: 'scheduled',
    },
    scoreFor: {
      type: Number,
      min: 0,
      default: null,
    },
    scoreAgainst: {
      type: Number,
      min: 0,
      default: null,
    },
    setsDetail: [setDetailSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('Match', matchSchema);
