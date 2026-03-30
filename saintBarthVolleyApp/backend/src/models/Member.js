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

    birthDate: Date,

    photo: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    // 🔗 lien futur avec user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Member', memberSchema);
