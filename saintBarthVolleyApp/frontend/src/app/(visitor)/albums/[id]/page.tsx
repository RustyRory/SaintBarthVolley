import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import AlbumGallery from "./album-gallery";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveUrl(src: string) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

// ─── Types ─────────────────────────────────────────────────────────────────

type Media = {
  _id: string;
  url: string;
  type: "photo" | "video";
  caption: string;
  order: number;
};

type Team = { _id: string; name: string; slug?: string };
type Season = { _id: string; name: string };
type ClubEvent = { _id: string; title: string; date: string };
type NewsRef = { _id: string; title: string; slug: string };

type Album = {
  _id: string;
  title: string;
  description: string;
  coverPhoto: string;
  eventDate: string | null;
  createdAt: string;
  teamIds: Team[];
  seasonId: Season | null;
  eventId: ClubEvent | null;
  newsId: NewsRef | null;
  medias: Media[];
};

// ─── Data ──────────────────────────────────────────────────────────────────

async function getAlbum(id: string): Promise<Album | null> {
  try {
    return await apiFetch<Album>(`/api/albums/${id}?public=true`);
  } catch {
    return null;
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);

  if (!album) notFound();

  const photos = album.medias.filter((m) => m.type === "photo");
  const cover = album.coverPhoto ? resolveUrl(album.coverPhoto) : null;
  const date = album.eventDate ?? album.createdAt;

  const resolvedPhotos = photos.map((m) => ({
    ...m,
    url: resolveUrl(m.url),
  }));

  return (
    <div className="flex flex-col flex-1 bg-gray-100 text-gray-900 font-sans">
      <Navbar />

      {/* Hero avec photo de couverture */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={album.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
        <div className="relative h-48 sm:h-64 pt-16" />
      </section>

      {/* Breadcrumb */}
      <div className="bg-green-900 py-4 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <Link
            href="/albums"
            className="text-green-300 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            Galerie photos
          </Link>
          <span className="text-green-500 text-xs">›</span>
          <span className="text-green-300/70 text-xs truncate">
            {album.title}
          </span>
        </div>
      </div>

      {/* Contenu */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* En-tête album */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {album.teamIds.map((t) => (
              <Link
                key={t._id}
                href={`/equipes/${t.slug || t._id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
              >
                🏐 {t.name}
              </Link>
            ))}
            {album.seasonId && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                📅 {album.seasonId.name}
              </span>
            )}
            {album.eventId && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                🎉 {album.eventId.title}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            {album.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>
              {new Date(date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span>
              {photos.length} photo{photos.length > 1 ? "s" : ""}
            </span>
          </div>

          {album.description && (
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {album.description}
            </p>
          )}

          {album.newsId && (
            <div className="mt-4">
              <Link
                href={`/actualites/${album.newsId.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors"
              >
                📰 Lire l&apos;article associé : {album.newsId.title}
              </Link>
            </div>
          )}
        </div>

        {/* Galerie */}
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-2xl">
            <span className="text-5xl mb-4">📷</span>
            <p className="font-medium text-gray-500">
              Aucune photo dans cet album.
            </p>
          </div>
        ) : (
          <AlbumGallery photos={resolvedPhotos} />
        )}

        {/* Retour */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
          >
            ← Retour à la galerie
          </Link>
        </div>
      </div>

      <VisitorFooter />
    </div>
  );
}
