import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverPhoto: { type: String, default: '' },
    eventDate: { type: Date, default: null },
    isPublic: { type: Boolean, default: true },

    // Associations optionnelles (un album peut être lié à plusieurs contextes)
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', default: null },
    teamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    newsId: { type: mongoose.Schema.Types.ObjectId, ref: 'News', default: null },
  },
  { timestamps: true },
);

albumSchema.index({ teamIds: 1 });
albumSchema.index({ matchId: 1 });
albumSchema.index({ newsId: 1 });
albumSchema.index({ isPublic: 1 });

export default mongoose.model('Album', albumSchema);
