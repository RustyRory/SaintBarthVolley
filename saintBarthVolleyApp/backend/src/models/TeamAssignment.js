import mongoose from 'mongoose';

export const TEAM_ROLES = ['player', 'coach', 'assistant_coach'];

// Positions volleyball (pertinentes seulement pour les joueurs)
export const PLAYER_POSITIONS = [
  'setter', // Passeur
  'libero', // Libéro
  'receiver', // Réceptionneur-attaquant
  'attacker', // Attaquant (pointu)
  'middle', // Central
  'universal', // Universel
  'opposite', // Opposé
];

export const TEAM_ROLE_LABELS = {
  player: 'Joueur',
  coach: 'Entraîneur',
  assistant_coach: 'Entraîneur assistant',
};

export const POSITION_LABELS = {
  setter: 'Passeur',
  libero: 'Libéro',
  receiver: 'Réceptionneur-attaquant',
  attacker: 'Attaquant',
  middle: 'Central',
  universal: 'Universel',
  opposite: 'Opposé',
};

const teamAssignmentSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    seasonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Season', required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    role: { type: String, enum: TEAM_ROLES, required: true },
    // Joueurs uniquement
    position: { type: String, default: '' },
    isCaptain: { type: Boolean, default: false },
    jerseyNumber: { type: Number, default: null },
    // Photo spécifique à ce contexte (maillot, action…)
    photo: { type: String, default: '' },
  },
  { timestamps: true },
);

teamAssignmentSchema.index({ teamId: 1, seasonId: 1 });
teamAssignmentSchema.index({ memberId: 1, seasonId: 1 });

export default mongoose.model('TeamAssignment', teamAssignmentSchema);
