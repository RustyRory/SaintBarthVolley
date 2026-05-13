import { notFound } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveUrl(src: string) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Author {
  firstName: string;
  lastName: string;
}
interface Team {
  _id: string;
  slug?: string;
  name: string;
}
interface ClubEvent {
  _id: string;
  title: string;
  date: string;
  location?: string;
}
interface Album {
  _id: string;
  title: string;
  coverPhoto?: string;
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  authorId: Author | null;
  teamId: Team | null;
  eventId: ClubEvent | null;
  albumId: Album | null;
}

interface NewsListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt: string | null;
  createdAt: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

async function getArticle(slug: string): Promise<Article | null> {
  try {
    return await apiFetch<Article>(`/api/news/${slug}`);
  } catch {
    return null;
  }
}

async function getRecentNews(excludeSlug: string): Promise<NewsListItem[]> {
  try {
    const all = await apiFetch<NewsListItem[]>("/api/news?published=true");
    return all.filter((n) => n.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

function readingTime(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function fDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, related] = await Promise.all([
    getArticle(slug),
    getRecentNews(slug),
  ]);

  if (!article || !article.isPublished) notFound();

  const cover = article.coverImage ? resolveUrl(article.coverImage) : null;
  const date = article.publishedAt ?? article.createdAt;
  const minutes = readingTime(article.content);
  const albumCover = article.albumId?.coverPhoto
    ? resolveUrl(article.albumId.coverPhoto)
    : null;

  const hasRelated = article.teamId || article.eventId || article.albumId;

  return (
    <div className="flex flex-col flex-1 bg-gray-100 text-gray-900 font-sans">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        <div className="h-32 sm:h-40 pt-16" />
      </section>
      <div className="bg-green-900 py-4 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <Link
            href="/actualites"
            className="text-green-300 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
          >
            Actualités
          </Link>
          <span className="text-green-500 text-xs">›</span>
          <span className="text-green-300/70 text-xs truncate">
            {article.title}
          </span>
        </div>
      </div>

      {/* ── Carte article ── */}
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-10 pb-12">
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Photo de couverture */}
          {cover && (
            <div className="w-full aspect-[21/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {article.teamId && (
                <Link
                  href={`/equipes/${article.teamId.slug || article.teamId._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  🏐 {article.teamId.name}
                </Link>
              )}
              {article.eventId && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                  📅 {article.eventId.title}
                </span>
              )}
              {article.albumId && (
                <Link
                  href={`/albums/${article.albumId._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors"
                >
                  📷 Album photo
                </Link>
              )}
            </div>

            {/* Titre */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {article.title}
            </h1>

            {/* Méta */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 pb-6 border-b border-gray-100">
              {article.authorId && (
                <span className="font-semibold text-gray-600">
                  {article.authorId.firstName} {article.authorId.lastName}
                </span>
              )}
              <span>{fDate(date)}</span>
              <span>{minutes} min de lecture</span>
            </div>

            {/* Accroche */}
            {article.excerpt && (
              <p className="text-lg text-gray-600 leading-relaxed mt-6 mb-2 font-medium border-l-4 border-green-500 pl-4 italic">
                {article.excerpt}
              </p>
            )}

            {/* Contenu */}
            <div
              className="tiptap-editor mt-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* ── Liens associés ── */}
            {hasRelated && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  En lien avec cet article
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Équipe */}
                  {article.teamId && (
                    <Link
                      href={`/equipes/${article.teamId.slug || article.teamId._id}`}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-green-200 hover:bg-green-50 transition-all"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-lg group-hover:scale-110 transition-transform">
                        🏐
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          Équipe
                        </p>
                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-green-700 transition-colors">
                          {article.teamId.name}
                        </p>
                      </div>
                      <span className="ml-auto text-gray-300 group-hover:text-green-500 transition-colors text-lg">
                        →
                      </span>
                    </Link>
                  )}

                  {/* Événement */}
                  {article.eventId && (
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-lg">
                        📅
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400 font-medium">
                          Événement
                        </p>
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {article.eventId.title}
                        </p>
                        {article.eventId.date && (
                          <p className="text-xs text-gray-400">
                            {new Date(article.eventId.date).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Album photo */}
                  {article.albumId && (
                    <Link
                      href={`/albums/${article.albumId._id}`}
                      className="group flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-purple-200 hover:bg-purple-50 transition-all overflow-hidden relative"
                    >
                      {albumCover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={albumCover}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity"
                        />
                      )}
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-lg relative group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <div className="min-w-0 relative">
                        <p className="text-xs text-gray-400 font-medium">
                          Album photo
                        </p>
                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-purple-700 transition-colors">
                          {article.albumId.title}
                        </p>
                      </div>
                      <span className="ml-auto text-gray-300 group-hover:text-purple-500 transition-colors text-lg relative">
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Pied de carte */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <Link
                href="/actualites"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
              >
                ← Retour aux actualités
              </Link>
              <span className="text-xs text-gray-300">{fDate(date)}</span>
            </div>
          </div>
        </article>
      </div>

      {/* ── Autres articles ── */}
      {related.length > 0 && (
        <section className="bg-white border-t border-gray-100 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Autres articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => {
                const itemCover = item.coverImage
                  ? resolveUrl(item.coverImage)
                  : null;
                const itemDate = item.publishedAt ?? item.createdAt;
                return (
                  <Link
                    key={item._id}
                    href={`/actualites/${item.slug}`}
                    className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
                  >
                    <div className="aspect-video bg-gray-100 overflow-hidden shrink-0">
                      {itemCover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={itemCover}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-green-700 transition-colors mb-1">
                        {item.title}
                      </p>
                      {item.excerpt && (
                        <p className="text-xs text-gray-500 line-clamp-2 flex-1">
                          {item.excerpt}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">
                        {new Date(itemDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <VisitorFooter />
    </div>
  );
}
