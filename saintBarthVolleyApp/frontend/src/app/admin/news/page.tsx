"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: string;
  createdAt: string;
  authorId?: { firstName: string; lastName: string } | string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function getAuthorName(authorId: NewsItem["authorId"]): string {
  if (!authorId) return "—";
  if (typeof authorId === "object")
    return `${authorId.firstName} ${authorId.lastName}`;
  return "—";
}

export default function NewsPage() {
  const [news, setNews] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    apiFetch<NewsItem[]>("/api/news")
      .then(setNews)
      .catch(() => alert("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleTogglePublish = async (item: NewsItem) => {
    try {
      const updated = await apiFetch<NewsItem>(`/api/news/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });
      setNews((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    } catch {
      alert("Erreur");
    }
  };

  const handleToggleFeatured = async (item: NewsItem) => {
    try {
      const updated = await apiFetch<NewsItem>(`/api/news/${item._id}`, {
        method: "PUT",
        body: JSON.stringify({ isFeatured: !item.isFeatured }),
      });
      setNews((prev) => prev.map((n) => (n._id === updated._id ? updated : n)));
    } catch {
      alert("Erreur");
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

  const filtered = search
    ? news.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()))
    : news;

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Actualités</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {news.length} article{news.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-green-600 font-medium">
              {news.filter((n) => n.isPublished).length} publiés
            </span>
            {" · "}
            <span className="text-yellow-600 font-medium">
              {news.filter((n) => n.isFeatured).length} à la une
            </span>
          </p>
        </div>
        <Link href="/admin/news/new">
          <Button>+ Nouvel article</Button>
        </Link>
      </div>

      {/* Recherche */}
      <Input
        placeholder="Rechercher un article..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <p className="font-medium">
            {news.length === 0
              ? "Aucun article pour le moment."
              : "Aucun résultat."}
          </p>
          {news.length === 0 && (
            <Link href="/admin/news/new">
              <Button>Créer le premier article</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const cover = item.coverImage
              ? item.coverImage.startsWith("http")
                ? item.coverImage
                : `${API}${item.coverImage}`
              : null;

            return (
              <div
                key={item._id}
                className="border rounded-xl bg-background flex gap-4 p-4 hover:shadow-sm transition-shadow"
              >
                {/* Miniature cover */}
                {cover && (
                  <div className="w-24 h-16 sm:w-32 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Contenu */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.isPublished ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}
                      >
                        {item.isPublished ? "Publié" : "Brouillon"}
                      </span>
                      {item.isFeatured && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          ★ Une
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                      {item.authorId
                        ? ` · ${getAuthorName(item.authorId)}`
                        : ""}
                    </span>
                  </div>

                  <p className="font-semibold text-sm sm:text-base line-clamp-1">
                    {item.title}
                  </p>

                  {item.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.excerpt}
                    </p>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Link href={`/admin/news/${item._id}`}>
                      <Button size="sm" variant="outline">
                        Modifier
                      </Button>
                    </Link>
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
                      {item.isFeatured ? "★ Une" : "☆ Une"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item._id)}
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
    </div>
  );
}
