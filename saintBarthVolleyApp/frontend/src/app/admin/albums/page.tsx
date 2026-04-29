"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  _id: string;
  name: string;
}
interface Season {
  _id: string;
  name: string;
  status: string;
}

interface Album {
  _id: string;
  title: string;
  description: string;
  coverPhoto: string;
  eventDate: string | null;
  isPublic: boolean;
  seasonId: Season | null;
  teamIds: Team[];
  newsId: { _id: string; title: string } | null;
  createdAt: string;
}

interface Media {
  _id: string;
  albumId: string;
  url: string;
  type: "photo" | "video";
  caption: string;
  order: number;
  isPublic: boolean;
}

type EditingAlbum = {
  _id?: string;
  title: string;
  description: string;
  eventDate: string;
  isPublic: boolean;
  seasonId: string;
  teamIds: string[];
};

const EMPTY_ALBUM: EditingAlbum = {
  title: "",
  description: "",
  eventDate: "",
  isPublic: true,
  seasonId: "",
  teamIds: [],
};

function resolveUrl(src: string): string {
  if (!src) return "";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return src;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlbumsPage() {
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  // Album editing
  const [editing, setEditing] = React.useState<EditingAlbum | null>(null);
  const [saving, setSaving] = React.useState(false);

  // Media panel
  const [selectedAlbum, setSelectedAlbum] = React.useState<Album | null>(null);
  const [medias, setMedias] = React.useState<Media[]>([]);
  const [loadingMedia, setLoadingMedia] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [coverUploading, setCoverUploading] = React.useState(false);

  React.useEffect(() => {
    Promise.all([
      apiFetch<Album[]>("/api/albums"),
      apiFetch<Team[]>("/api/teams"),
      apiFetch<Season[]>("/api/seasons"),
    ])
      .then(([a, t, s]) => {
        setAlbums(a);
        setTeams(t);
        setSeasons(s);
      })
      .catch(() => alert("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  const openMediaPanel = async (album: Album) => {
    setSelectedAlbum(album);
    setLoadingMedia(true);
    try {
      const data = await apiFetch<{ medias: Media[] }>(
        `/api/albums/${album._id}`,
      );
      setMedias(data.medias ?? []);
    } catch {
      setMedias([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSaveAlbum = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        ...editing,
        seasonId: editing.seasonId || null,
        teamIds: editing.teamIds,
        eventDate: editing.eventDate || null,
      };
      let result: Album;
      if (editing._id) {
        result = await apiFetch(`/api/albums/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setAlbums((prev) =>
          prev.map((a) => (a._id === result._id ? result : a)),
        );
      } else {
        result = await apiFetch("/api/albums", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setAlbums((prev) => [result, ...prev]);
      }
      setEditing(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("Supprimer cet album et tous ses médias ?")) return;
    try {
      await apiFetch(`/api/albums/${id}`, { method: "DELETE" });
      setAlbums((prev) => prev.filter((a) => a._id !== id));
      if (selectedAlbum?._id === id) setSelectedAlbum(null);
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleTogglePublic = async (album: Album) => {
    try {
      const result: Album = await apiFetch(`/api/albums/${album._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublic: !album.isPublic }),
      });
      setAlbums((prev) => prev.map((a) => (a._id === result._id ? result : a)));
    } catch {
      alert("Erreur");
    }
  };

  const handleUploadCover = async (
    file: File,
    albumId: string,
    oldCover?: string,
  ) => {
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (oldCover) fd.append("oldFile", oldCover.replace("/uploads/", ""));
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const { fileUrl } = await res.json();
      const result: Album = await apiFetch(`/api/albums/${albumId}`, {
        method: "PUT",
        body: JSON.stringify({ coverPhoto: fileUrl }),
      });
      setAlbums((prev) => prev.map((a) => (a._id === result._id ? result : a)));
      if (selectedAlbum?._id === albumId) setSelectedAlbum(result);
    } catch {
      alert("Erreur upload couverture");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleUploadMedia = async (files: FileList) => {
    if (!selectedAlbum) return;
    setUploading(true);
    const newMedias: Media[] = [];
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch(`${API}/api/upload`, {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const { fileUrl } = await res.json();
        const media: Media = await apiFetch("/api/medias", {
          method: "POST",
          body: JSON.stringify({
            albumId: selectedAlbum._id,
            url: fileUrl,
            type: "photo",
            order: medias.length + newMedias.length,
            isPublic: true,
          }),
        });
        newMedias.push(media);
      }
      setMedias((prev) => [...prev, ...newMedias]);
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Supprimer ce média ?")) return;
    try {
      await apiFetch(`/api/medias/${mediaId}`, { method: "DELETE" });
      setMedias((prev) => prev.filter((m) => m._id !== mediaId));
    } catch {
      alert("Erreur");
    }
  };

  const filtered = albums
    .filter(
      (a) => !search || a.title.toLowerCase().includes(search.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Albums & Médias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {albums.length} album{albums.length !== 1 ? "s" : ""} ·{" "}
            {albums.filter((a) => a.isPublic).length} publics
          </p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY_ALBUM })}>
          + Nouvel album
        </Button>
      </div>

      <Input
        placeholder="Rechercher un album..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      {/* Grille albums */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <div className="text-4xl mb-3">📷</div>
          <p>Aucun album. Créez votre premier album photo !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((album) => {
            const cover = album.coverPhoto
              ? resolveUrl(album.coverPhoto)
              : null;
            return (
              <div
                key={album._id}
                className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow"
              >
                {/* Couverture */}
                <div className="h-36 bg-muted relative overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl">
                      📷
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${album.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"}`}
                    >
                      {album.isPublic ? "Public" : "Privé"}
                    </span>
                  </div>
                  {/* Upload couverture */}
                  <label className="absolute bottom-2 left-2 cursor-pointer">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium bg-black/50 text-white hover:bg-black/70 transition-colors ${coverUploading ? "opacity-50" : ""}`}
                    >
                      {coverUploading ? "..." : "📷 Couverture"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={coverUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f)
                          handleUploadCover(f, album._id, album.coverPhoto);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-sm truncate">
                      {album.title}
                    </p>
                    {album.eventDate && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(album.eventDate).toLocaleDateString("fr-FR")}
                      </p>
                    )}
                    {album.teamIds?.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {album.teamIds.map((t) => t.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMediaPanel(album)}
                    >
                      Médias
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          _id: album._id,
                          title: album.title,
                          description: album.description,
                          eventDate: album.eventDate?.slice(0, 10) ?? "",
                          isPublic: album.isPublic,
                          seasonId:
                            (album.seasonId as Season | null)?._id ?? "",
                          teamIds: (album.teamIds ?? []).map((t) => t._id),
                        })
                      }
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant={album.isPublic ? "secondary" : "outline"}
                      onClick={() => handleTogglePublic(album)}
                    >
                      {album.isPublic ? "Dépublier" : "Publier"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteAlbum(album._id)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal : Créer / modifier un album ── */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold">
                {editing._id ? "Modifier l'album" : "Nouvel album"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
              <div className="flex flex-col gap-1">
                <Label>Titre *</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, title: e.target.value })
                  }
                  placeholder="Nom de l'album"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label>Description</Label>
                <textarea
                  className="border rounded px-3 py-2 text-sm resize-y min-h-20 bg-background"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing(
                      (p) => p && { ...p, description: e.target.value },
                    )
                  }
                  placeholder="Description de l'album..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label>Date de l&apos;événement</Label>
                  <Input
                    type="date"
                    value={editing.eventDate}
                    onChange={(e) =>
                      setEditing(
                        (p) => p && { ...p, eventDate: e.target.value },
                      )
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label>Saison</Label>
                  <select
                    value={editing.seasonId}
                    onChange={(e) =>
                      setEditing((p) => p && { ...p, seasonId: e.target.value })
                    }
                    className="border rounded px-3 py-2 text-sm bg-background"
                  >
                    <option value="">— Aucune —</option>
                    {seasons.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Équipes associées</Label>
                <div className="border rounded p-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto bg-background">
                  {teams.map((t) => (
                    <label
                      key={t._id}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={editing.teamIds.includes(t._id)}
                        onChange={(e) =>
                          setEditing((p) => {
                            if (!p) return p;
                            const ids = e.target.checked
                              ? [...p.teamIds, t._id]
                              : p.teamIds.filter((id) => id !== t._id);
                            return { ...p, teamIds: ids };
                          })
                        }
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs">{t.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.isPublic}
                  onChange={(e) =>
                    setEditing((p) => p && { ...p, isPublic: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Album public</span>
              </label>
            </div>
            <div className="p-5 border-t flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveAlbum}
                disabled={saving || !editing.title.trim()}
              >
                {saving
                  ? "Sauvegarde..."
                  : editing._id
                    ? "Mettre à jour"
                    : "Créer l'album"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panneau médias ── */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold">{selectedAlbum.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {medias.length} média{medias.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
              {/* Upload */}
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="text-3xl mb-2">📤</div>
                <p className="text-sm font-medium">
                  {uploading ? "Upload en cours..." : "Ajouter des photos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cliquez ou glissez des fichiers ici
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    if (e.target.files?.length)
                      handleUploadMedia(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {/* Grille médias */}
              {loadingMedia ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Chargement...
                </div>
              ) : medias.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucun média dans cet album.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {medias.map((m) => (
                    <div
                      key={m._id}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveUrl(m.url)}
                        alt={m.caption}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handleDeleteMedia(m._id)}
                          className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                          title="Supprimer"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
