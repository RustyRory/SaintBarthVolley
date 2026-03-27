// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: { type: String, enum: ['admin', 'editor', 'user', 'other'], default: 'user' },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, // ✅ Compte confirmé ou pas
    verificationToken: { type: String }, // ✅ Token pour activer le compte
    verificationTokenExpires: { type: Date }, // ✅ Expiration du token
    isActive: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    passwordUpdatedAt: { type: Date, default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

// Comparer un mot de passe
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Définir ou changer le mot de passe
UserSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(password, salt);
  this.passwordUpdatedAt = new Date();
};

// Générer un token de vérification
UserSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
