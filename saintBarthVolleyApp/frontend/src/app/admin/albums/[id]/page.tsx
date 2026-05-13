"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Season {
  _id: string;
  name: string;
  status: string;
}
interface Team {
  _id: string;
  name: string;
}
interface ClubEvent {
  _id: string;
  title: string;
  date: string;
}
interface Media {
  _id: string;
  url: string;
  type: "photo" | "video";
  caption: string;
  order: number;
  isPublic: boolean;
}

interface AlbumForm {
  title: string;
  description: string;
  eventDate: string;
  isPublic: boolean;
  seasonId: string;
  teamIds: string[];
  eventId: string;
  coverPhoto: string;
}

const EMPTY: AlbumForm = {
  title: "",
  description: "",
  eventDate: "",
  isPublic: true,
  seasonId: "",
  teamIds: [],
  eventId: "",
  coverPhoto: "",
};

function resolveUrl(src: string): string {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AlbumEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";

  const [form, setForm] = React.useState<AlbumForm>(EMPTY);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [seasons, setSeasons] = React.useState<Season[]>([]);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [medias, setMedias] = React.useState<Media[]>([]);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [albumId, setAlbumId] = React.useState<string | null>(
    isNew ? null : (id as string),
  );

  const [eventModal, setEventModal] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({
    title: "",
    type: "other",
    date: "",
    location: "",
  });
  const [eventSaving, setEventSaving] = React.useState(false);

  React.useEffect(() => {
    const loads: Promise<unknown>[] = [
      apiFetch<Season[]>("/api/seasons").catch(() => [] as Season[]),
      apiFetch<Team[]>("/api/teams?seasonId=all").catch(() => [] as Team[]),
      apiFetch<ClubEvent[]>("/api/events").catch(() => [] as ClubEvent[]),
    ];
    if (!isNew) {
      loads.push(
        apiFetch<{ medias: Media[] } & Record<string, unknown>>(
          `/api/albums/${id}`,
        ),
      );
    }

    Promise.all(loads)
      .then(([seasonsData, teamsData, eventsData, albumData]) => {
        setSeasons(seasonsData as Season[]);
        setTeams(teamsData as Team[]);
        setEvents(eventsData as ClubEvent[]);
        if (albumData) {
          const a = albumData as Record<string, unknown>;
          setForm({
            title: (a.title as string) ?? "",
            description: (a.description as string) ?? "",
            eventDate: a.eventDate ? (a.eventDate as string).slice(0, 10) : "",
            isPublic: (a.isPublic as boolean) ?? true,
            seasonId:
              typeof a.seasonId === "object" && a.seasonId !== null
                ? (a.seasonId as { _id: string })._id
                : ((a.seasonId as string) ?? ""),
            teamIds: Array.isArray(a.teamIds)
              ? (a.teamIds as Array<{ _id: string } | string>).map((t) =>
                  typeof t === "object" ? t._id : t,
                )
              : [],
            eventId:
              typeof a.eventId === "object" && a.eventId !== null
                ? (a.eventId as { _id: string })._id
                : ((a.eventId as string) ?? ""),
            coverPhoto: (a.coverPhoto as string) ?? "",
          });
          setMedias((a.medias as Media[]) ?? []);
        }
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  // ── Cover upload ─────────────────────────────────────────────────────────────

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const { fileUrl } = await res.json();
      setForm((p) => ({ ...p, coverPhoto: fileUrl }));
      if (albumId) {
        await apiFetch(`/api/albums/${albumId}`, {
          method: "PUT",
          body: JSON.stringify({ coverPhoto: fileUrl }),
        });
      }
    } catch {
      alert("Erreur upload couverture");
    } finally {
      setCoverUploading(false);
    }
  };

  // ── Media upload ──────────────────────────────────────────────────────────────

  const handleUploadMedia = async (files: FileList) => {
    if (!albumId) {
      alert("Sauvegardez d'abord l'album avant d'ajouter des photos.");
      return;
    }
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
            albumId,
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
    if (!confirm("Supprimer cette photo ?")) return;
    try {
      await apiFetch(`/api/medias/${mediaId}`, { method: "DELETE" });
      setMedias((prev) => prev.filter((m) => m._id !== mediaId));
    } catch {
      alert("Erreur");
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.date) {
      alert("Le titre et la date sont obligatoires.");
      return;
    }
    setEventSaving(true);
    try {
      const created = await apiFetch<ClubEvent>("/api/events", {
        method: "POST",
        body: JSON.stringify({ ...eventForm, isPublic: true }),
      });
      setEvents((prev) => [created, ...prev]);
      setForm((p) => ({ ...p, eventId: created._id }));
      setEventModal(false);
      setEventForm({ title: "", type: "other", date: "", location: "" });
    } catch {
      alert("Erreur lors de la création de l'événement");
    } finally {
      setEventSaving(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Le titre est obligatoire.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        seasonId: form.seasonId || null,
        eventId: form.eventId || null,
        eventDate: form.eventDate || null,
      };
      if (isNew) {
        const created = await apiFetch<{ _id: string }>("/api/albums", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setAlbumId(created._id);
        router.replace(`/admin/albums/${created._id}`);
      } else {
        await apiFetch(`/api/albums/${albumId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde",
      );
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading)
    return <div className="p-8 text-muted-foreground">Chargement…</div>;

  const coverSrc = form.coverPhoto ? resolveUrl(form.coverPhoto) : null;

  return (
    <>
      <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
        {/* ── Header fixe ── */}
        <div className="flex items-center justify-between gap-4 py-4 border-b bg-background sticky top-0 z-20 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/albums")}
            >
              ← Retour
            </Button>
            <span className="text-sm text-muted-foreground">
              {isNew ? "Nouvel album" : form.title || "Sans titre"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-sm text-green-600">✓ Sauvegardé</span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Sauvegarde…" : isNew ? "Créer l'album" : "Enregistrer"}
            </Button>
            <Button
              size="sm"
              variant={form.isPublic ? "secondary" : "default"}
              onClick={() => {
                setForm((p) => ({ ...p, isPublic: !p.isPublic }));
              }}
            >
              {form.isPublic ? "Dépublier" : "Publier"}
            </Button>
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="flex flex-col lg:flex-row gap-6 py-6 flex-1 min-h-0">
          {/* Colonne principale */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Couverture */}
            <div>
              {coverSrc ? (
                <div
                  className="relative group rounded-xl overflow-hidden mb-4"
                  style={{ aspectRatio: "16/6" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverSrc}
                    alt="Couverture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer">
                      <span className="bg-white text-black text-sm font-medium px-3 py-1.5 rounded">
                        {coverUploading ? "Upload…" : "Changer"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleCoverUpload(f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      onClick={() => setForm((p) => ({ ...p, coverPhoto: "" }))}
                      className="bg-white text-red-600 text-sm font-medium px-3 py-1.5 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer hover:bg-muted/30 transition-colors mb-4 ${coverUploading ? "opacity-50" : ""}`}
                >
                  <span className="text-4xl mb-2">📷</span>
                  <span className="text-sm font-medium">
                    {coverUploading
                      ? "Upload en cours…"
                      : "Ajouter une image de couverture"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={coverUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCoverUpload(f);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>

            {/* Titre */}
            <input
              className="text-3xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
              placeholder="Titre de l'album…"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
            />

            {/* Description */}
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-base text-muted-foreground placeholder:text-muted-foreground/40 focus:ring-0 leading-relaxed"
              placeholder="Description de l'album…"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />

            <div className="border-t" />

            {/* Médias */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-base">
                  Photos
                  {medias.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {medias.length}
                    </span>
                  )}
                </h2>
              </div>

              {/* Zone d'upload */}
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""} ${!albumId ? "opacity-40" : ""}`}
              >
                <div className="text-3xl mb-2">📤</div>
                <p className="text-sm font-medium">
                  {uploading ? "Upload en cours…" : "Ajouter des photos"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!albumId
                    ? "Sauvegardez d'abord l'album"
                    : "Cliquez ou glissez plusieurs fichiers"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploading || !albumId}
                  onChange={(e) => {
                    if (e.target.files?.length)
                      handleUploadMedia(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>

              {/* Grille */}
              {medias.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
                          className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700"
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

          {/* ── Panneau latéral ── */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-4">
            {/* Statut */}
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Visibilité
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Statut</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                >
                  {form.isPublic ? "Public" : "Privé"}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.isPublic}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isPublic: e.target.checked }))
                  }
                />
                <span className="text-sm">Visible sur le site public</span>
              </label>
            </div>

            {/* Infos */}
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Informations
              </p>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Date de l&apos;événement</Label>
                <input
                  type="date"
                  className="border rounded px-3 py-1.5 text-sm bg-background w-full"
                  value={form.eventDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, eventDate: e.target.value }))
                  }
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Saison</Label>
                <select
                  className="border rounded px-3 py-1.5 text-sm bg-background w-full"
                  value={form.seasonId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, seasonId: e.target.value }))
                  }
                >
                  <option value="">— Aucune —</option>
                  {seasons.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Événement lié</Label>
                  <button
                    type="button"
                    onClick={() => setEventModal(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    + Créer un événement
                  </button>
                </div>
                <select
                  className="border rounded px-3 py-1.5 text-sm bg-background w-full"
                  value={form.eventId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, eventId: e.target.value }))
                  }
                >
                  <option value="">— Aucun événement —</option>
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.title} — {new Date(e.date).toLocaleDateString("fr-FR")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Équipes */}
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Équipes associées
              </p>
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {teams.map((t) => (
                  <label
                    key={t._id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-primary"
                      checked={form.teamIds.includes(t._id)}
                      onChange={(e) =>
                        setForm((p) => {
                          const ids = e.target.checked
                            ? [...p.teamIds, t._id]
                            : p.teamIds.filter((id) => id !== t._id);
                          return { ...p, teamIds: ids };
                        })
                      }
                    />
                    <span className="text-xs">{t.name}</span>
                  </label>
                ))}
                {teams.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucune équipe disponible
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border rounded-lg p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </p>
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saving}
                variant="outline"
              >
                {saving
                  ? "Sauvegarde…"
                  : isNew
                    ? "Créer l'album"
                    : "Enregistrer"}
              </Button>
              <Button
                className="w-full"
                variant={form.isPublic ? "secondary" : "default"}
                onClick={() =>
                  setForm((p) => ({ ...p, isPublic: !p.isPublic }))
                }
              >
                {form.isPublic ? "Dépublier" : "Publier"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal création événement ── */}
      {eventModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <h2 className="text-base font-semibold">Créer un événement</h2>
              <button
                onClick={() => setEventModal(false)}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Titre *</Label>
                <input
                  className="border rounded px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Nom de l'événement"
                  value={eventForm.title}
                  onChange={(e) =>
                    setEventForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Type</Label>
                  <select
                    className="border rounded px-3 py-2 text-sm bg-background w-full"
                    value={eventForm.type}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, type: e.target.value }))
                    }
                  >
                    <option value="loto">Loto</option>
                    <option value="ag">Assemblée Générale</option>
                    <option value="tournament">Tournoi</option>
                    <option value="partner">Partenaire</option>
                    <option value="team">Équipe</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs">Date *</Label>
                  <input
                    type="datetime-local"
                    className="border rounded px-3 py-2 text-sm bg-background w-full"
                    value={eventForm.date}
                    onChange={(e) =>
                      setEventForm((p) => ({ ...p, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs">Lieu</Label>
                <input
                  className="border rounded px-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Gymnase, salle des fêtes…"
                  value={eventForm.location}
                  onChange={(e) =>
                    setEventForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="p-5 border-t flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEventModal(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={
                  eventSaving || !eventForm.title.trim() || !eventForm.date
                }
              >
                {eventSaving ? "Création…" : "Créer et associer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
