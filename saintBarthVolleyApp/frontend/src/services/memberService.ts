import { apiFetch } from "@/lib/api";

export type Member = {
  _id?: string; // généré par MongoDB
  firstName: string;
  lastName: string;
  birthDate?: string; // optionnel
  photo?: string; // optionnel
  bio?: string; // optionnel
  userId?: string; // optionnel, lien futur avec User
  isActive?: boolean; // optionnel, défaut true
  createdAt?: string; // généré par timestamps
  updatedAt?: string; // généré par timestamps
};

// Récupérer tous les membres
export async function getMembers(): Promise<Member[]> {
  return apiFetch("/api/members");
}

// Supprimer un membre
export async function deleteMember(id: string) {
  return apiFetch(`/api/members/${id}`, {
    method: "DELETE",
  });
}

// Créer un membre
export async function createMember(member: Member): Promise<Member> {
  return apiFetch("/api/members", {
    method: "POST",
    body: JSON.stringify(member),
  });
}

// Mettre à jour un membre
export async function updateMember(
  id: string,
  member: Member,
): Promise<Member> {
  return apiFetch(`/api/members/${id}`, {
    method: "PUT",
    body: JSON.stringify(member),
  });
}
