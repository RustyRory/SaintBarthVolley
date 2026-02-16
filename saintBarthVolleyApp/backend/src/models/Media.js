import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['photo', 'video'],
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  },
);

export default mongoose.model('Media', mediaSchema);
