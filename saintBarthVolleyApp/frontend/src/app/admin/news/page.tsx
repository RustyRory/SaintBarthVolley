"use client";

import * as React from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  authorId?: { firstName: string; lastName: string } | string;
}

type EditingNews = Partial<Omit<NewsItem, "_id" | "authorId">> & {
  _id?: string;
};

const EMPTY: EditingNews = {
  title: "",
  content: "",
  isPublished: false,
  isFeatured: false,
};

function previewSlug(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function NewsPage() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const [editing, setEditing] = React.useState<EditingNews | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const data: NewsItem[] = await apiFetch("/api/news");
      setNews(data);
    } catch {
      alert("Erreur lors du chargement des actualités");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      const updated: NewsItem = await apiFetch(`/api/news/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      setNews((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleToggleFeatured = async (item: NewsItem) => {
    try {
      const updated: NewsItem = await apiFetch(`/api/news/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });
      setNews((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    } catch {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await apiFetch(`/api/news/${id}`, { method: "DELETE" });
      setNews((prev) => prev.filter((n) => n._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let result: NewsItem;
      if (editing._id) {
        result = await apiFetch(`/api/news/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(editing),
        });
        setNews((prev) => prev.map((n) => (n._id === result._id ? result : n)));
      } else {
        result = await apiFetch("/api/news", {
          method: "POST",
          body: JSON.stringify(editing),
        });
        setNews((prev) => [result, ...prev]);
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

  const getAuthorName = (authorId: NewsItem["authorId"]): string => {
    if (!authorId) return "-";
    if (typeof authorId === "object")
      return `${authorId.firstName} ${authorId.lastName}`;
    return "-";
  };

  const filtered = search
    ? news.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    : news;

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Actualités</h1>
        <Button onClick={() => setEditing({ ...EMPTY })}>
          + Nouvel article
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground flex gap-3">
          <span>{news.length} articles</span>
          <span>·</span>
          <span className="text-green-600 font-medium">
            {news.filter((n) => n.isPublished).length} publiés
          </span>
          <span>·</span>
          <span className="text-yellow-600 font-medium">
            {news.filter((n) => n.isFeatured).length} à la une
          </span>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {filtered.map((item) => (
          <div
            key={item._id}
            className="border rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold">{item.title}</div>
              <div className="flex gap-1 shrink-0">
                {item.isPublished && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">
                    Publié
                  </span>
                )}
                {item.isFeatured && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                    ★
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString("fr-FR")} ·{" "}
              {getAuthorName(item.authorId)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.content}
            </p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(item)}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant={item.isPublished ? "secondary" : "outline"}
                onClick={() => handleTogglePublish(item)}
              >
                {item.isPublished ? "Dépublier" : "Publier"}
              </Button>
              <Button
                size="sm"
                variant={item.isFeatured ? "secondary" : "outline"}
                onClick={() => handleToggleFeatured(item)}
              >
                {item.isFeatured ? "★ Une" : "☆ Une"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(item._id)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Aucun article
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Titre</th>
              <th className="p-3 text-left">Auteur</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Statut</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="p-3 max-w-xs">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.content.slice(0, 70)}…
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    {getAuthorName(item.authorId)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {item.isPublished ? "Publié" : "Brouillon"}
                      </span>
                      {item.isFeatured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          ★ Une
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditing(item)}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant={item.isPublished ? "secondary" : "outline"}
                        onClick={() => handleTogglePublish(item)}
                      >
                        {item.isPublished ? "Dépublier" : "Publier"}
                      </Button>
                      <Button
                        size="sm"
                        variant={item.isFeatured ? "secondary" : "ghost"}
                        onClick={() => handleToggleFeatured(item)}
                        title={
                          item.isFeatured
                            ? "Retirer de la une"
                            : "Mettre à la une"
                        }
                      >
                        {item.isFeatured ? "★" : "☆"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="h-40 text-center text-muted-foreground"
                >
                  Aucun article. Créez votre premier article !
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold">
              {editing._id ? "Modifier l'article" : "Nouvel article"}
            </h2>

            <div className="flex flex-col gap-1">
              <Label>Titre *</Label>
              <Input
                value={editing.title || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, title: e.target.value })
                }
                placeholder="Titre de l'article"
              />
              {editing.title && (
                <p className="text-xs text-muted-foreground">
                  Slug :{" "}
                  <span className="font-mono">
                    {previewSlug(editing.title)}
                  </span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Contenu *</Label>
              <textarea
                className="border rounded px-3 py-2 text-sm resize-y min-h-48 bg-background"
                value={editing.content || ""}
                onChange={(e) =>
                  setEditing((p) => p && { ...p, content: e.target.value })
                }
                placeholder="Rédigez votre article ici..."
              />
            </div>

            <div className="flex gap-6 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.isPublished ?? false}
                  onChange={(e) =>
                    setEditing(
                      (p) => p && { ...p, isPublished: e.target.checked },
                    )
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Publier l&apos;article</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editing.isFeatured ?? false}
                  onChange={(e) =>
                    setEditing(
                      (p) => p && { ...p, isFeatured: e.target.checked },
                    )
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">★ Mettre à la une</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  saving || !editing.title?.trim() || !editing.content?.trim()
                }
              >
                {saving
                  ? "Sauvegarde..."
                  : editing._id
                    ? "Mettre à jour"
                    : "Créer l'article"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
