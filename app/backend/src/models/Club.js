import mongoose from 'mongoose';

const ClubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subtitle: { type: String, default: '' },
    homeDescription: { type: String, default: '' },
    clubDescription: { type: String, default: '' },
    ownerDescription: { type: String, default: '' },
    logo: { type: String, default: '' }, // URL ou chemin du logo
    photo: { type: String, default: '' }, // URL ou chemin de la photo principale
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },

    // Liens sociaux
    social_links: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      sporteasy: { type: String, default: '' },
      website: { type: String, default: '' },
      other: { type: String, default: '' }
    },

    // Informations légales
    legal_info: {
      associationName: { type: String, default: '' },
      legalForm: { type: String, default: '' },
      siret: { type: String, default: '' },
      rna: { type: String, default: '' },
      headOffice: { type: String, default: '' },
      publicationDate: { type: Date, default: null },
      responsible: { type: String, default: '' },
      hostingProvider: { type: String, default: '' },
      updatedAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
); // createdAt et updatedAt automatiques

export default mongoose.model('Club', ClubSchema);
