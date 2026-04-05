"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Partner {
  _id: string;
  name: string;
  description?: string;
  logo: string;
  website?: string;
  priority: number;
  isActive: boolean;
}

const EMPTY: Omit<Partner, "_id"> = {
  name: "",
  description: "",
  logo: "",
  website: "",
  priority: 0,
  isActive: true,
};

export default function PartnersPage() {
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showInactive, setShowInactive] = React.useState(true);

  const [editing, setEditing] = React.useState<Partial<Partner> | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data: Partner[] = await apiFetch("/api/partners?all=true");
      setPartners(data.sort((a, b) => a.priority - b.priority));
    } catch {
      alert("Erreur lors du chargement des partenaires");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated: Partner = await apiFetch(`/api/partners/${id}/toggle`, {
        method: "PATCH",
      });
      setPartners((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p)),
      );
    } catch {
      alert("Erreur lors du changement de statut");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    try {
      await apiFetch(`/api/partners/${id}`, { method: "DELETE" });
      setPartners((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let result: Partner;
      if (editing._id) {
        result = await apiFetch(`/api/partners/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(editing),
        });
        setPartners((prev) =>
          prev
            .map((p) => (p._id === result._id ? result : p))
            .sort((a, b) => a.priority - b.priority),
        );
      } else {
        result = await apiFetch("/api/partners", {
          method: "POST",
          body: JSON.stringify(editing),
        });
        setPartners((prev) =>
          [...prev, result].sort((a, b) => a.priority - b.priority),
        );
      }
      setEditing(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  const displayed = showInactive
    ? partners
    : partners.filter((p) => p.isActive);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Partenaires</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4"
            />
            Afficher les inactifs
          </label>
          <Button onClick={() => setEditing({ ...EMPTY })}>
            + Nouveau partenaire
          </Button>
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4 border rounded-lg">
          <p>Aucun partenaire.</p>
          <Button variant="outline" onClick={() => setEditing({ ...EMPTY })}>
            Ajouter le premier partenaire
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((p) => (
            <div
              key={p._id}
              className={`border rounded-lg p-4 flex flex-col gap-3 transition-opacity ${
                !p.isActive ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {p.logo ? (
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="h-12 w-12 object-contain rounded border bg-white p-1 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground shrink-0">
                    Logo
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{p.name}</div>
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline truncate block"
                    >
                      {p.website}
                    </a>
                  )}
                </div>
              </div>

              {p.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {p.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Priorité : {p.priority}</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    p.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {p.isActive ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="flex gap-2 pt-1 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(p)}
                >
                  Modifier
                </Button>
                <Button
                  size="sm"
                  variant={p.isActive ? "secondary" : "outline"}
                  className="flex-1"
                  onClick={() => handleToggle(p._id)}
                >
                  {p.isActive ? "Désactiver" : "Activer"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(p._id)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">
              {editing._id ? "Modifier le partenaire" : "Nouveau partenaire"}
            </h2>

            <div className="flex flex-col gap-1">
              <Label>Nom *</Label>
              <Input
                value={editing.name || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, name: e.target.value })
                }
                placeholder="Nom du partenaire"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Logo (URL de l&apos;image)</Label>
              <Input
                value={editing.logo || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, logo: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
              {editing.logo && (
                <img
                  src={editing.logo}
                  alt="Aperçu logo"
                  className="h-14 w-auto object-contain border rounded p-1 bg-white mt-1 self-start"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Site web</Label>
              <Input
                value={editing.website || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, website: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Description</Label>
              <textarea
                className="border rounded px-3 py-2 text-sm resize-none h-20 bg-background"
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, description: e.target.value })
                }
                placeholder="Quelques mots sur ce partenaire..."
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Priorité d&apos;affichage</Label>
              <Input
                type="number"
                min={0}
                value={editing.priority ?? 0}
                onChange={(e) =>
                  setEditing(
                    (p) => p && { ...p, priority: Number(e.target.value) },
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Valeur la plus basse = affiché en premier sur le site
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.isActive ?? true}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, isActive: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span className="text-sm">
                Partenaire actif (visible sur le site)
              </span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !editing.name?.trim()}
              >
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
