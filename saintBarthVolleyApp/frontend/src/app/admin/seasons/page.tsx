"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { SeasonForm } from "@/components/dashboard/admin/season-form";
import { Season } from "@/types/season";

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [filteredSeasons, setFilteredSeasons] = React.useState<Season[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [editingSeason, setEditingSeason] = React.useState<Season | null>(null);

  React.useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      const data: Season[] = await apiFetch("/api/seasons");
      setSeasons(data);
      setFilteredSeasons(data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération des saisons");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let result = seasons;
    if (search)
      result = result.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (statusFilter !== "all")
      result = result.filter((s) => s.status === statusFilter);
    setFilteredSeasons(result);
  }, [search, statusFilter, seasons]);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette saison ?")) return;
    try {
      await apiFetch(`/api/seasons/${id}`, { method: "DELETE" });
      setSeasons((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <h1 className="text-2xl font-bold">Gestion des saisons</h1>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Rechercher..."
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="future">Future</SelectItem>
            <SelectItem value="archived">Archivée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={() => setEditingSeason({} as Season)}>
        Créer une saison
      </Button>

      {/* Liste mobile */}
      <div className="flex flex-col gap-4 md:hidden mt-4">
        {filteredSeasons.map((season) => (
          <div
            key={season._id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="font-semibold">{season.name}</div>
            <div className="text-sm text-muted-foreground">
              {new Date(season.startDate).toLocaleDateString()} -{" "}
              {new Date(season.endDate).toLocaleDateString()}
            </div>
            <div className="text-sm capitalize">Statut : {season.status}</div>

            <div className="flex gap-2 mt-2">
              <Link href={`/admin/seasons/${season._id}/teams`}>
                <Button size="sm">Voir les équipes</Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingSeason(season)}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => season._id && handleDelete(season._id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filteredSeasons.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Pas de saison, veuillez en créer une.
          </div>
        )}
      </div>

      {/* Liste desktop */}
      <div className="hidden md:flex flex-col flex-1 rounded-lg border mt-4">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Dates</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Équipes</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSeasons.length > 0 ? (
              filteredSeasons.map((season) => (
                <tr key={season._id} className="border-t">
                  <td className="p-3 font-semibold">{season.name}</td>
                  <td className="p-3">
                    {new Date(season.startDate).toLocaleDateString()} -{" "}
                    {new Date(season.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-3 capitalize">{season.status}</td>
                  <td className="p-3">
                    <Link href={`/admin/seasons/${season._id}/teams`}>
                      <Button size="sm" variant="outline">
                        Voir les équipes
                      </Button>
                    </Link>
                  </td>
                  <td className="p-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingSeason(season)}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => season._id && handleDelete(season._id)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="h-60 flex flex-col items-center justify-center text-muted-foreground"
                >
                  Pas de saison, veuillez en créer une.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal SeasonForm */}
      {editingSeason && (
        <SeasonForm
          season={editingSeason}
          onClose={() => setEditingSeason(null)}
          onSave={(updatedSeason) => {
            setSeasons((prev) => {
              const exists = prev.find((s) => s._id === updatedSeason._id);
              if (exists)
                return prev.map((s) =>
                  s._id === updatedSeason._id ? updatedSeason : s,
                );
              return [...prev, updatedSeason];
            });
            setEditingSeason(null);
          }}
        />
      )}
    </div>
  );
}
