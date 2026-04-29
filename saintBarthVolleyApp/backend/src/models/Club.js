import mongoose from 'mongoose';

const valueSchema = new mongoose.Schema(
  {
    emoji: { type: String, default: '🏐' },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { _id: true },
);

const ClubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Saint Barthélémy Volley-Ball',
      required: true,
    },
    subtitle: {
      type: String,
      default: 'Passion, Performance, Partage',
      required: true,
    },
    homeDescription: {
      type: String,
      default: 'Bienvenue sur le site officiel du Saint Barthélémy Volley-Ball.',
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
      default: '/assets/images/default_logo.png',
    },
    photo: {
      type: String,
      default: '/assets/images/default_club_photo.png',
    },
    aboutPhoto: {
      type: String,
      default: '',
    },
    email: { type: String, default: 'contact@saintbarthvolley.fr' },
    phone: { type: String, default: '' },
    address: { type: String, default: 'Saint-Barthélemy, Caraïbes' },

    values: {
      type: [valueSchema],
      default: [
        {
          emoji: '❤️',
          title: 'Passion',
          description:
            'Le volley-ball est avant tout une passion partagée. Nous transmettons cet amour du sport à chaque entraînement.',
        },
        {
          emoji: '🏆',
          title: 'Performance',
          description:
            "Nous accompagnons chaque joueur vers l'excellence, quel que soit son niveau, avec un encadrement de qualité.",
        },
        {
          emoji: '🤝',
          title: 'Partage',
          description:
            'Le collectif est notre force. Ensemble, nous construisons une communauté soudée et bienveillante.',
        },
      ],
    },

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
