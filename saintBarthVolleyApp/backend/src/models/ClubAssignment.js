import mongoose from 'mongoose';

// Rôles prédéfinis au niveau du club (pas liés à une équipe)
export const CLUB_ROLES = [
  // Direction
  'president',
  'vice_president',
  'secretary',
  'treasurer',
  // Opérationnel
  'communication',
  'sport_manager',
  'event_manager',
  'equipment_manager',
  // Terrain
  'referee',
  'volunteer',
  // Autre
  'other',
];

export const CLUB_ROLE_LABELS = {
  president: 'Président',
  vice_president: 'Vice-président',
  secretary: 'Secrétaire',
  treasurer: 'Trésorier',
  communication: 'Responsable communication',
  sport_manager: 'Responsable sportif',
  event_manager: 'Responsable événements',
  equipment_manager: 'Responsable matériel',
  referee: 'Arbitre',
  volunteer: 'Bénévole',
  other: 'Autre',
};

const clubAssignmentSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    role: { type: String, enum: CLUB_ROLES, required: true },
    customTitle: { type: String, default: '' }, // utilisé si role === 'other'
    photo: { type: String, default: '' },
    displayOrder: { type: Number, default: 0 }, // ordre d'affichage
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Index pour requêtes fréquentes
clubAssignmentSchema.index({ seasonId: 1, role: 1 });
clubAssignmentSchema.index({ memberId: 1 });

export default mongoose.model('ClubAssignment', clubAssignmentSchema);
