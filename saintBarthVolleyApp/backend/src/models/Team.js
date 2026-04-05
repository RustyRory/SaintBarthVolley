import mongoose from 'mongoose';

const trainingScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    location: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['Young', 'Senior', 'Veteran'], required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Mixed'], required: true },
    level: { type: String, trim: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    trainingSchedule: [trainingScheduleSchema],
    photo: { type: String, trim: true },
    federationUrl: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true },
);

const Team = mongoose.model('Team', teamSchema);
export default Team;
