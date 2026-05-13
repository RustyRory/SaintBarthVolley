"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const RichTextEditor = dynamic(
  () => import("@/components/editor/rich-text-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg h-96 bg-muted/20 animate-pulse" />
    ),
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  _id: string;
  name: string;
}
interface ClubEvent {
  _id: string;
  title: string;
  date: string;
}

interface NewsForm {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  teamId: string;
  eventId: string;
  isPublished: boolean;
  isFeatured: boolean;
}

function previewSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const EMPTY: NewsForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  teamId: "",
  eventId: "",
  isPublished: false,
  isFeatured: false,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArticleEditorPage() {
  const { id } = useParams();
  const router = useRouter();
  const isNew = id === "new";

  const [form, setForm] = React.useState<NewsForm>(EMPTY);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [events, setEvents] = React.useState<ClubEvent[]>([]);
  const [coverUploading, setCoverUploading] = React.useState(false);

  // ── Création d'événement inline ─────────────────────────────────────────────
  const [eventModal, setEventModal] = React.useState(false);
  const [eventForm, setEventForm] = React.useState({
    title: "",
    type: "other",
    date: "",
    location: "",
  });
  const [eventSaving, setEventSaving] = React.useState(false);

  // ── Chargement ──────────────────────────────────────────────────────────────

  React.useEffect(() => {
    const loads: Promise<unknown>[] = [
      apiFetch<Team[]>("/api/teams?seasonId=all").catch(() => [] as Team[]),
      apiFetch<ClubEvent[]>("/api/events").catch(() => [] as ClubEvent[]),
    ];

    if (!isNew) {
      loads.push(apiFetch(`/api/news/${id}`));
    }

    Promise.all(loads)
      .then(([teamsData, eventsData, articleData]) => {
        setTeams(teamsData as Team[]);
        setEvents(eventsData as ClubEvent[]);
        if (articleData) {
          const a = articleData as Record<string, unknown>;
          setForm({
            title: (a.title as string) ?? "",
            excerpt: (a.excerpt as string) ?? "",
            content: (a.content as string) ?? "",
            coverImage: (a.coverImage as string) ?? "",
            teamId:
              typeof a.teamId === "object" && a.teamId !== null
                ? (a.teamId as { _id: string })._id
                : ((a.teamId as string) ?? ""),
            eventId:
              typeof a.eventId === "object" && a.eventId !== null
                ? (a.eventId as { _id: string })._id
                : ((a.eventId as string) ?? ""),
            isPublished: (a.isPublished as boolean) ?? false,
            isFeatured: (a.isFeatured as boolean) ?? false,
          });
        }
      })
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

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

  // ── Cover image upload ──────────────────────────────────────────────────────

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
      setForm((p) => ({ ...p, coverImage: fileUrl }));
    } catch {
      alert("Erreur lors de l'upload");
    } finally {
      setCoverUploading(false);
    }
  };

  // ── Sauvegarde ──────────────────────────────────────────────────────────────

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !form.content.trim()) {
      alert("Le titre et le contenu sont obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        teamId: form.teamId || undefined,
        eventId: form.eventId || undefined,
        isPublished: publish !== undefined ? publish : form.isPublished,
      };

      if (isNew) {
        const created = await apiFetch<{ _id: string }>("/api/news", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        router.replace(`/admin/news/${created._id}`);
      } else {
        await apiFetch(`/api/news/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        if (publish !== undefined) {
          setForm((p) => ({ ...p, isPublished: publish }));
        }
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

  const coverSrc = form.coverImage
    ? form.coverImage.startsWith("http")
      ? form.coverImage
      : `${API}${form.coverImage}`
    : null;

  return (
    <>
      <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
        {/* ── Header fixe ── */}
        <div className="flex items-center justify-between gap-4 py-4 border-b bg-background sticky top-0 z-20 flex-wrap">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/news")}
            >
              ← Retour
            </Button>
            <span className="text-sm text-muted-foreground">
              {isNew ? "Nouvel article" : form.title || "Sans titre"}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {saved && (
              <span className="text-sm text-green-600">✓ Sauvegardé</span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving}
            >
              {saving ? "Sauvegarde…" : "Enregistrer"}
            </Button>

            {!form.isPublished ? (
              <Button
                size="sm"
                onClick={() => handleSave(true)}
                disabled={saving}
              >
                Publier
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                Dépublier
              </Button>
            )}
          </div>
        </div>

        {/* ── Corps ── */}
        <div className="flex flex-col lg:flex-row gap-6 py-6 flex-1 min-h-0">
          {/* Colonne principale */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            {/* Couverture */}
            <div>
              {coverSrc ? (
                <div
                  className="relative group rounded-xl overflow-hidden mb-3"
                  style={{ aspectRatio: "21/9" }}
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
                      onClick={() => setForm((p) => ({ ...p, coverImage: "" }))}
                      className="bg-white text-red-600 text-sm font-medium px-3 py-1.5 rounded"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer hover:bg-muted/30 transition-colors mb-3 ${coverUploading ? "opacity-50" : ""}`}
                >
                  <span className="text-3xl mb-2">🖼</span>
                  <span className="text-sm font-medium">
                    {coverUploading
                      ? "Upload en cours…"
                      : "Ajouter une image de couverture"}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP — recommandé 1200×630
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
            <div className="flex flex-col gap-1">
              <input
                className="text-3xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/50 focus:ring-0"
                placeholder="Titre de l'article…"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
              {form.title && (
                <p className="text-xs text-muted-foreground font-mono">
                  /{previewSlug(form.title)}
                </p>
              )}
            </div>

            {/* Accroche */}
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none text-lg text-muted-foreground placeholder:text-muted-foreground/40 focus:ring-0 leading-relaxed"
              placeholder="Accroche / résumé de l'article (affiché dans les previews)…"
              rows={2}
              value={form.excerpt}
              onChange={(e) =>
                setForm((p) => ({ ...p, excerpt: e.target.value }))
              }
            />

            <div className="border-t" />

            {/* Éditeur */}
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm((p) => ({ ...p, content: html }))}
            />
          </div>

          {/* Panneau latéral */}
          <div className="lg:w-72 shrink-0 flex flex-col gap-4">
            {/* Statut */}
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Statut
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm">Publication</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${form.isPublished ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                >
                  {form.isPublished ? "Publié" : "Brouillon"}
                </span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, isFeatured: e.target.checked }))
                  }
                />
                <span className="text-sm">★ Mettre à la une</span>
              </label>

              <p className="text-xs text-muted-foreground">
                Les articles à la une apparaissent en carousel sur la page
                d&apos;accueil.
              </p>
            </div>

            {/* Associations */}
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Associations
              </p>

              <div className="flex flex-col gap-1">
                <Label className="text-xs">Équipe liée</Label>
                <Select
                  value={form.teamId || "__none__"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      teamId: v === "__none__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Aucune équipe —</SelectItem>
                    {teams.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  value={form.eventId || "__none__"}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      eventId: v === "__none__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      — Aucun événement —
                    </SelectItem>
                    {events.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.title} —{" "}
                        {new Date(e.date).toLocaleDateString("fr-FR")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="border rounded-lg p-4 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </p>
              <Button
                className="w-full"
                onClick={() => handleSave()}
                disabled={saving}
                variant="outline"
              >
                Enregistrer
              </Button>
              {!form.isPublished ? (
                <Button
                  className="w-full"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  Publier l&apos;article
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  variant="secondary"
                >
                  Dépublier
                </Button>
              )}
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
