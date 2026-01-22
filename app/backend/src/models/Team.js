import mongoose from 'mongoose';

const trainingScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      required: true,
    },
    startTime: {
      type: String, // HH:mm
      required: true,
    },
    endTime: {
      type: String, // HH:mm
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Jeunes', 'Séniors', 'Loisirs'],
      required: true,
    },
    gender: {
      type: String,
      enum: ['Masculin', 'Féminin', 'Mixte'],
      required: true,
    },
    level: {
      type: String,
      trim: true,
    },
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },
    trainingSchedule: [trainingScheduleSchema],
    coachIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    photo: {
      type: String, // URL Nextcloud
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Team = mongoose.model('Team', teamSchema);

export default Team;
