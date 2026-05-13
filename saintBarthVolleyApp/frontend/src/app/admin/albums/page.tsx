"use client";

import * as React from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Season {
  _id: string;
  name: string;
}
interface Team {
  _id: string;
  name: string;
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
  createdAt: string;
}

function resolveUrl(src: string): string {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

export default function AlbumsPage() {
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [coverUploading, setCoverUploading] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    apiFetch<Album[]>("/api/albums")
      .then(setAlbums)
      .catch(() => alert("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet album et tous ses médias ?")) return;
    try {
      await apiFetch(`/api/albums/${id}`, { method: "DELETE" });
      setAlbums((prev) => prev.filter((a) => a._id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const handleUploadCover = async (file: File, album: Album) => {
    setCoverUploading(album._id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API}/api/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const { fileUrl } = await res.json();
      const result: Album = await apiFetch(`/api/albums/${album._id}`, {
        method: "PUT",
        body: JSON.stringify({ coverPhoto: fileUrl }),
      });
      setAlbums((prev) => prev.map((a) => (a._id === result._id ? result : a)));
    } catch {
      alert("Erreur upload couverture");
    } finally {
      setCoverUploading(null);
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Albums & Médias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {albums.length} album{albums.length !== 1 ? "s" : ""}
            {" · "}
            <span className="text-green-600 font-medium">
              {albums.filter((a) => a.isPublic).length} publics
            </span>
          </p>
        </div>
        <Link href="/admin/albums/new">
          <Button>+ Nouvel album</Button>
        </Link>
      </div>

      <Input
        placeholder="Rechercher un album..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <div className="text-5xl">📷</div>
          <p className="font-medium">
            {albums.length === 0
              ? "Aucun album pour le moment."
              : "Aucun résultat."}
          </p>
          {albums.length === 0 && (
            <Link href="/admin/albums/new">
              <Button>Créer le premier album</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((album) => {
            const cover = album.coverPhoto
              ? resolveUrl(album.coverPhoto)
              : null;
            const uploading = coverUploading === album._id;
            return (
              <div
                key={album._id}
                className="border rounded-xl overflow-hidden bg-card hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Couverture */}
                <div className="relative h-40 bg-muted group overflow-hidden">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
                      📷
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${album.isPublic ? "bg-green-100 text-green-700" : "bg-zinc-200 text-zinc-600"}`}
                    >
                      {album.isPublic ? "Public" : "Privé"}
                    </span>
                  </div>
                  <label className="absolute bottom-2 left-2 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium bg-black/60 text-white hover:bg-black/80 ${uploading ? "opacity-50" : ""}`}
                    >
                      {uploading ? "Upload…" : "Changer la couverture"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadCover(f, album);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div>
                    <p className="font-semibold text-sm line-clamp-1">
                      {album.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {album.eventDate
                        ? new Date(album.eventDate).toLocaleDateString("fr-FR")
                        : new Date(album.createdAt).toLocaleDateString("fr-FR")}
                      {album.teamIds?.length > 0 &&
                        ` · ${album.teamIds.map((t) => t.name).join(", ")}`}
                    </p>
                    {album.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {album.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap mt-auto pt-1">
                    <Link href={`/admin/albums/${album._id}`}>
                      <Button size="sm" variant="outline">
                        Modifier
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant={album.isPublic ? "secondary" : "outline"}
                      onClick={() => handleTogglePublic(album)}
                    >
                      {album.isPublic ? "Dépublier" : "Publier"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(album._id)}
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
