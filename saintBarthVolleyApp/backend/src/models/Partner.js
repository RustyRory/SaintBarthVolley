import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    logo: {
      type: String, // URL (Nextcloud ou externe)
      required: true,
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    priority: {
      type: Number,
      default: 0, // non required → 0 = ordre neutre
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

export default mongoose.model('Partner', partnerSchema);
