import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    types: {
      type: [
        {
          type: String,
          enum: ['owner', 'staff', 'volunteer', 'player', 'coach', 'other'],
        },
      ],
      required: true,
      validate: [(v) => v.length > 0, 'One type at least is required'],
    },
    role: {
      type: String,
      trim: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    seasonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Season',
      required: true,
    },
    birthDate: {
      type: Date,
    },
    position: {
      type: String,
      trim: true,
    },
    height: {
      type: Number,
      min: 0,
    },
    weight: {
      type: Number,
      min: 0,
    },
    photo: {
      type: String, // URL Nextcloud
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Member = mongoose.model('Member', memberSchema);

export default Member;
