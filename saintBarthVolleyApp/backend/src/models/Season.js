import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'future'],
      default: 'future',
    },
  },
  { timestamps: true },
);

const Season = mongoose.model('Season', seasonSchema);
export default Season;
