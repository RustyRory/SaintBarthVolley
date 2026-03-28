/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  type Member,
} from "@/services/memberService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberForm } from "@/components/dashboard/admin/members-form";

// Pour le dialogue des équipes
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function AdminMembersPage() {
  const [members, setMembers] = React.useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [isCreating, setIsCreating] = React.useState(false);

  // Dialogue équipes
  const [teamsDialogMember, setTeamsDialogMember] =
    React.useState<Member | null>(null);
  const [teams, setTeams] = React.useState<any[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);

  // 🔹 Fetch members
  React.useEffect(() => {
    getMembers()
      .then((data) => {
        setMembers(data);
        setFilteredMembers(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔹 Filter
  React.useEffect(() => {
    let result = members;
    if (search) {
      result = result.filter((m) =>
        `${m.firstName} ${m.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    setFilteredMembers(result);
  }, [search, members]);

  // 🔹 Delete
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await deleteMember(id);
      setMembers(members.filter((m) => m._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur suppression");
    }
  };

  // 🔹 Save (create or update)
  const handleSave = async (member: Member) => {
    if (member._id) {
      // update
      const updated = await updateMember(member._id, member);
      setMembers((prev) =>
        prev.map((m) => (m._id === updated._id ? updated : m)),
      );
    } else {
      // create
      const created = await createMember(member);
      setMembers((prev) => [created, ...prev]);
    }
    setEditingMember(null);
    setIsCreating(false);
  };

  // 🔹 Open Teams Dialog
  const openTeamsDialog = async (member: Member) => {
    setTeamsDialogMember(member);
    setTeamsLoading(true);
    try {
      const res = await fetch(`/api/memberSeasons?memberId=${member._id}`);
      const data = await res.json();
      const allTeams = data.flatMap((ms: any) => ms.teams || []);
      setTeams(allTeams);
    } catch (err) {
      console.error(err);
      setTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };

  // 🔹 Calculate age
  const getAge = (birthDate?: string) => {
    if (!birthDate) return "-";
    const diff = new Date().getTime() - new Date(birthDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1 h-full">
      <h1 className="text-2xl font-bold">Gestion des membres</h1>

      {/* 🔎 Search + Create */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Input
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingMember(null);
          }}
          className="sm:w-40"
        >
          + Créer membre
        </Button>
      </div>

      {/* 📝 Form Modal */}
      {(editingMember || isCreating) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-full sm:max-w-2xl w-full p-6 overflow-auto max-h-[90vh]">
            <MemberForm
              member={
                editingMember || {
                  firstName: "",
                  lastName: "",
                  birthDate: undefined,
                  photo: "",
                  bio: "",
                  isActive: true,
                }
              }
              onChange={(m) => setEditingMember(m)}
              onSave={handleSave} // seulement via bouton sauvegarder
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditingMember(null);
                  setIsCreating(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 Mobile Cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredMembers.map((member) => (
          <div
            key={member._id ?? Math.random()}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="font-semibold">
              {member.firstName} {member.lastName}
            </div>
            <div className="text-sm">
              Actif : {member.isActive ? "Oui" : "Non"}
            </div>
            <div className="text-xs text-muted-foreground">
              {getAge(member.birthDate)} ans
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button size="sm" onClick={() => setEditingMember(member)}>
                Modifier
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(member._id)}
              >
                Supprimer
              </Button>
              <Button size="sm" onClick={() => openTeamsDialog(member)}>
                Équipes
              </Button>
            </div>
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Aucun membre
          </div>
        )}
      </div>

      {/* 💻 Desktop Table */}
      <div className="hidden md:flex flex-col flex-1 rounded-lg border overflow-auto min-h-[400px]">
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left hidden lg:table-cell">Âge</th>
              <th className="p-3 text-left hidden lg:table-cell">Bio</th>
              <th className="p-3 text-left">Actif</th>
              <th className="p-3 text-left">Équipes</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <tr key={member._id ?? Math.random()} className="border-t">
                  <td className="p-3">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    {getAge(member.birthDate)}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    {member.bio || "-"}
                  </td>
                  <td className="p-3">{member.isActive ? "Oui" : "Non"}</td>
                  <td className="p-3">
                    <Button size="sm" onClick={() => openTeamsDialog(member)}>
                      Équipes
                    </Button>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button size="sm" onClick={() => setEditingMember(member)}>
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(member._id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="h-60">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <p className="text-sm">Aucun Membre</p>
                    <p className="text-xs">Commencez par en créer un</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 Teams Dialog */}
      {teamsDialogMember && (
        <Dialog open onOpenChange={() => setTeamsDialogMember(null)}>
          <DialogContent className="max-w-lg w-full">
            <DialogTitle className="text-lg font-semibold mb-4">
              Équipes de {teamsDialogMember.firstName}{" "}
              {teamsDialogMember.lastName}
            </DialogTitle>
            {teamsLoading ? (
              <p>Chargement...</p>
            ) : (
              <ul className="list-disc list-inside">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <li key={team._id}>
                      {team.name} ({team.category})
                    </li>
                  ))
                ) : (
                  <li>Aucune équipe</li>
                )}
              </ul>
            )}
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setTeamsDialogMember(null)}>Fermer</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
