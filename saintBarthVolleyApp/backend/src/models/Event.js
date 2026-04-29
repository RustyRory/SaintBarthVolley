import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['loto', 'ag', 'tournament', 'partner', 'team', 'other'],
      default: 'other',
    },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    endDate: { type: Date, default: null },
    location: { type: String, default: '' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Event', EventSchema);
