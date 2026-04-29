import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    birthDate: { type: Date, default: null },
    bio: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // Lien optionnel vers un compte utilisateur (futur réseau social)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Member', memberSchema);
