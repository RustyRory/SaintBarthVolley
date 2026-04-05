type Role = "admin" | "editor" | "user" | "other";

type Entity = "users" | "clubs" | "teams" | "matches" | "standings";

type Action = "create" | "read" | "update" | "delete";

export type Permissions = {
  [key in Role]: {
    [entity in Entity]: Action[];
  };
};

// Permissions par rôle
export const permissions: Permissions = {
  admin: {
    users: ["create", "read", "update", "delete"],
    clubs: ["create", "read", "update", "delete"],
    teams: ["create", "read", "update", "delete"],
    matches: ["create", "read", "update", "delete"],
    standings: ["read"],
  },
  editor: {
    users: [],
    clubs: ["read", "update"],
    teams: ["read", "update"],
    matches: ["read", "update"],
    standings: ["read"],
  },
  user: {
    users: [],
    clubs: ["read"],
    teams: ["read"],
    matches: ["read"],
    standings: ["read"],
  },
  other: {
    users: [],
    clubs: ["read"],
    teams: ["read"],
    matches: [],
    standings: ["read"],
  },
};

// Fonction utilitaire pour vérifier si un rôle peut faire une action sur une entité
export function canPerform(role: Role, entity: Entity, action: Action) {
  return permissions[role][entity].includes(action);
}
