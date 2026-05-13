"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Images, Search, X, Calendar } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveUrl(src: string) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

type Album = {
  _id: string;
  title: string;
  description: string;
  coverPhoto: string;
  eventDate: string | null;
  createdAt: string;
  teamIds: { _id: string; name: string; slug?: string }[];
  seasonId: { _id: string; name: string } | null;
  eventId: { _id: string; title: string; date: string } | null;
};

function fDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function AlbumCard({ album }: { album: Album }) {
  const cover = resolveUrl(album.coverPhoto);
  const date = album.eventDate ?? album.createdAt;

  return (
    <Link
      href={`/albums/${album._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Cover */}
      <div className="aspect-video bg-gray-100 overflow-hidden relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={album.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
            <Images size={40} className="text-gray-300" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
            Voir l&apos;album →
          </span>
        </div>

        {/* Team badge */}
        {album.teamIds.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {album.teamIds.slice(0, 2).map((t) => (
              <span
                key={t._id}
                className="text-xs font-semibold bg-green-700/90 text-white px-2 py-0.5 rounded-full backdrop-blur-sm"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
          {album.title}
        </h3>
        {album.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {album.description}
          </p>
        )}
        <div className="mt-auto pt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={11} />
          <span>{fDate(date)}</span>
          {album.seasonId && (
            <>
              <span className="mx-1">·</span>
              <span className="text-green-600 font-medium">
                {album.seasonId.name}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function AlbumsClient({ albums }: { albums: Album[] }) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");

  const teams = useMemo(() => {
    const map = new Map<string, string>();
    albums.forEach((a) => a.teamIds.forEach((t) => map.set(t._id, t.name)));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [albums]);

  const seasons = useMemo(() => {
    const map = new Map<string, string>();
    albums.forEach((a) => {
      if (a.seasonId) map.set(a.seasonId._id, a.seasonId.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [albums]);

  const filtered = useMemo(() => {
    return albums.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (teamFilter !== "all" && !a.teamIds.some((t) => t._id === teamFilter))
        return false;
      if (seasonFilter !== "all" && a.seasonId?._id !== seasonFilter)
        return false;
      return true;
    });
  }, [albums, search, teamFilter, seasonFilter]);

  const hasFilters = search || teamFilter !== "all" || seasonFilter !== "all";

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Header + filters */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
          Galerie photos
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {albums.length} album{albums.length > 1 ? "s" : ""} disponible
          {albums.length > 1 ? "s" : ""}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un album…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Team filter */}
          {teams.length > 0 && (
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
            >
              <option value="all">Toutes les équipes</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}

          {/* Season filter */}
          {seasons.length > 0 && (
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700"
            >
              <option value="all">Toutes les saisons</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setTeamFilter("all");
                setSeasonFilter("all");
              }}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 px-2"
            >
              <X size={13} /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Images size={48} className="mb-4 opacity-30" />
          <p className="font-medium text-gray-500">
            {hasFilters
              ? "Aucun album ne correspond aux filtres."
              : "Aucun album disponible pour le moment."}
          </p>
          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setTeamFilter("all");
                setSeasonFilter("all");
              }}
              className="mt-3 text-sm text-green-600 hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((album) => (
            <AlbumCard key={album._id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
