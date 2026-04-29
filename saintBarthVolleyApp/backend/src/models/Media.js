import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
    url: { type: String, required: true, trim: true },
    type: { type: String, enum: ['photo', 'video'], required: true },
    caption: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

mediaSchema.index({ albumId: 1, order: 1 });

export default mongoose.model('Media', mediaSchema);
