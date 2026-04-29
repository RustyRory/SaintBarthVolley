import mongoose from 'mongoose';

export const CUP_TYPES = ['anjou', 'france', 'regional', 'other'];

export const CUP_TYPE_LABELS = {
  anjou: "Coupe de l'Anjou",
  france: 'Coupe de France',
  regional: 'Coupe Régionale',
  other: 'Autre coupe',
};

const cupPhaseSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    name: { type: String, required: true },
    type: { type: String, enum: CUP_TYPES, default: 'other' },
    url: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

cupPhaseSchema.index({ teamId: 1, seasonId: 1 });

export default mongoose.model('CupPhase', cupPhaseSchema);
