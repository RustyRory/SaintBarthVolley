import mongoose from 'mongoose';

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Saint Barthélémy Volley-Ball',
      required: true,
    },
    subtitle: {
      type: String,
      default: 'Passion, Performance, Partage', // Slogan plus dynamique
      required: true,
    },
    homeDescription: {
      type: String,
      default:
        'Bienvenue sur le site officiel du Saint Barthélémy Volley-Ball, le club où la passion du volley rencontre l’esprit d’équipe et la convivialité.',
    },
    clubDescription: {
      type: String,
      default:
        'Le club propose des entraînements pour tous les niveaux, des jeunes aux seniors, dans un esprit de partage et de progression.',
    },
    ownerDescription: {
      type: String,
      default:
        'Notre équipe dirigeante est composée de bénévoles passionnés, engagés pour le développement du volley-ball à Saint-Barthélémy.',
    },
    logo: {
      type: String,
      default: '/assets/images/default_logo.png', // chemin local par défaut
    },
    photo: {
      type: String,
      default: '/assets/images/default_club_photo.png', // chemin local par défaut
    },
    email: { type: String, default: 'contact@saintbarthvolley.fr' },
    phone: { type: String, default: '(+33) 02 41 XX XX XX' },
    address: { type: String, default: 'Saint-Barthélemy, Caraïbes' },

    // Liens sociaux
    social_links: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      sporteasy: { type: String, default: '' },
      clubMerch: { type: String, default: '' },
      clubRegistration: { type: String, default: '' },
      website: { type: String, default: '' },
      other: { type: String, default: '' },
    },

    // Informations légales
    legal_info: {
      associationName: { type: String, default: 'Saint Barth Volley-Ball' },
      legalForm: { type: String, default: 'Association loi 1901' },
      siret: { type: String, default: '' },
      rna: { type: String, default: '' },
      headOffice: { type: String, default: 'Saint-Barthélemy' },
      publicationDate: { type: Date, default: null },
      responsible: { type: String, default: '' },
      hostingProvider: { type: String, default: '' },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Club', ClubSchema);
