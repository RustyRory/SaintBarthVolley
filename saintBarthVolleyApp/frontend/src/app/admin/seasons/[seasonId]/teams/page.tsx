"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { TeamForm } from "@/components/dashboard/admin/team-form"; // Assurez-vous que ce composant accepte category: "Young" | "Senior" | "Veteran"

interface Team {
  _id?: string;
  name: string;
  category: "Young" | "Senior" | "Veteran";
  gender: "Mixed" | "Male" | "Female";
  level?: string;
  seasonId: string;
}

export default function SeasonTeamsPage() {
  const { seasonId } = useParams();
  const router = useRouter();

  const [teams, setTeams] = React.useState<Team[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editingTeam, setEditingTeam] = React.useState<Team | null>(null);

  // 🔹 Récupération des équipes
  const fetchTeams = React.useCallback(async () => {
    if (!seasonId || Array.isArray(seasonId)) return;
    setLoading(true);
    try {
      const data: Team[] = await apiFetch(`/api/teams?seasonId=${seasonId}`);
      setTeams(data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération des équipes");
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // 🔹 Supprimer une équipe
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Supprimer cette équipe ?")) return;
    try {
      await apiFetch(`/api/teams/${id}`, { method: "DELETE" });
      setTeams((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  // 🔹 Créer ou modifier une équipe
  const handleSave = async (team: Team) => {
    try {
      if (team._id) {
        // Mise à jour
        const updated = await apiFetch(`/api/teams/${team._id}`, {
          method: "PUT",
          body: JSON.stringify(team),
        });
        setTeams((prev) =>
          prev.map((t) => (t._id === updated._id ? updated : t)),
        );
      } else {
        // Création
        const created = await apiFetch(`/api/teams`, {
          method: "POST",
          body: JSON.stringify(team),
        });
        setTeams((prev) => [...prev, created]);
      }
      setEditingTeam(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de l'équipe");
    }
  };

  if (!seasonId || Array.isArray(seasonId)) {
    return <div className="p-6 text-red-600">ID de saison invalide</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <h1 className="text-2xl font-bold">Équipes de la saison</h1>

      <Button
        onClick={() =>
          setEditingTeam({
            name: "",
            category: "Senior",
            gender: "Male",
            seasonId,
          })
        }
      >
        Créer une équipe
      </Button>

      {loading ? (
        <div className="p-6">Chargement...</div>
      ) : teams.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground">
          Pas d&apos;équipe pour cette saison. Créez-en une&nbsp;!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Catégorie</th>
                <th className="p-3 text-left">Genre</th>
                <th className="p-3 text-left">Niveau</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team._id} className="border-t">
                  <td
                    className="p-3 cursor-pointer text-blue-600"
                    onClick={() =>
                      router.push(
                        `/admin/seasons/${seasonId}/teams/${team._id}`,
                      )
                    }
                  >
                    {team.name}
                  </td>
                  <td className="p-3">{team.category}</td>
                  <td className="p-3">{team.gender}</td>
                  <td className="p-3">{team.level || "-"}</td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTeam(team)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(team._id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTeam && (
        <TeamForm
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
