import Link from "next/link";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Club } from "@/components/visitor/club-context";
import FeaturedNewsCarousel, {
  type FeaturedArticle,
} from "@/components/visitor/featured-news-carousel";
import PartnersCarousel, {
  type Partner,
} from "@/components/visitor/partners-carousel";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImg(src?: string): string | null {
  if (!src || src.includes("default_")) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

async function getClub(): Promise<Club | null> {
  try {
    return await apiFetch<Club>("/api/clubs/public");
  } catch {
    return null;
  }
}

async function getFeaturedNews(): Promise<FeaturedArticle[]> {
  try {
    return await apiFetch<FeaturedArticle[]>(
      "/api/news?published=true&featured=true",
    );
  } catch {
    return [];
  }
}

async function getPartners(): Promise<Partner[]> {
  try {
    return await apiFetch<Partner[]>("/api/partners");
  } catch {
    return [];
  }
}

const DEFAULT_VALUES = [
  {
    _id: "1",
    emoji: "❤️",
    title: "Passion",
    description:
      "Le volley-ball est avant tout une passion partagée. Nous transmettons cet amour du sport à chaque entraînement.",
  },
  {
    _id: "2",
    emoji: "🏆",
    title: "Performance",
    description:
      "Nous accompagnons chaque joueur vers l'excellence, quel que soit son niveau, avec un encadrement de qualité.",
  },
  {
    _id: "3",
    emoji: "🤝",
    title: "Partage",
    description:
      "Le collectif est notre force. Ensemble, nous construisons une communauté soudée et bienveillante.",
  },
];

export default async function HomePage() {
  const [club, featuredNews, partners] = await Promise.all([
    getClub(),
    getFeaturedNews(),
    getPartners(),
  ]);

  const name = club?.name ?? "Saint Barthélémy Volley-Ball";
  const subtitle = club?.subtitle ?? "Passion, Performance, Partage";
  const homeDescription =
    club?.homeDescription ??
    "Rejoignez notre club de volley-ball, un espace de sport, de convivialité et de dépassement de soi sur l'île de Saint-Barthélemy.";
  const clubDescription =
    club?.clubDescription ??
    "Fondé avec l'ambition de développer le volley-ball sur l'île, notre club accueille joueurs et joueuses de tous niveaux dans une ambiance chaleureuse et compétitive.";
  const social = club?.social_links ?? {};
  const values =
    club?.values && club.values.length > 0 ? club.values : DEFAULT_VALUES;

  const heroPhoto = resolveImg(club?.photo);
  const aboutPhotoUrl = resolveImg(club?.aboutPhoto) ?? resolveImg(club?.photo);

  return (
    <div className="flex flex-col flex-1 bg-white text-gray-900 font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section
        id="accueil"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900"
      >
        {/* Background photo */}
        {heroPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroPhoto}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            {name}
          </h1>
          <p className="mt-3 text-xl sm:text-2xl text-green-300 font-medium">
            {subtitle}
          </p>
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-white/70 leading-relaxed">
            {homeDescription}
          </p>

          {/* Social links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-pink-600/80 backdrop-blur-sm border border-white/20 hover:border-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Instagram
              </a>
            )}
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-blue-600/80 backdrop-blur-sm border border-white/20 hover:border-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>
            )}
            {social.sporteasy && (
              <a
                href={social.sporteasy}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-green-600/80 backdrop-blur-sm border border-white/20 hover:border-green-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                <ExternalLink size={15} />
                SportEasy
              </a>
            )}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {social.clubRegistration ? (
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
              >
                <a
                  href={social.clubRegistration}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rejoindre le club <ArrowRight size={16} className="ml-2" />
                </a>
              </Button>
            ) : (
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
              >
                <a href="#contact">
                  Nous rejoindre <ArrowRight size={16} className="ml-2" />
                </a>
              </Button>
            )}
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            >
              <Link href="/club">Découvrir le club</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── NOS VALEURS ── */}
      <section id="valeurs" className="py-12 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
              Notre identité
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Nos valeurs
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
              Trois piliers qui guident notre club au quotidien
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {values.map((v) => (
              <Card
                key={v._id ?? v.title}
                className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-white"
              >
                <CardContent className="pt-8 pb-6 px-6 text-center">
                  <div className="text-4xl mb-4">{v.emoji}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {v.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOTRE CLUB ── */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                À propos
              </span>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Notre club
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                {clubDescription}
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Entraînements pour tous les niveaux",
                  "Compétitions fédérales et amicales",
                  "Ambiance conviviale et familiale",
                  "Encadrement par des coaches qualifiés",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-gray-600 text-sm"
                  >
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="mt-8 bg-green-700 hover:bg-green-800 text-white"
              >
                <Link href="/club">
                  En savoir plus <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
            </div>

            {/* About photo */}
            <div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-green-900">
              {aboutPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={aboutPhotoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white gap-3">
                  <div className="text-6xl">🏐</div>
                  <p className="text-green-200 text-sm font-medium">{name}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTUALITÉS ── */}
      <section id="actualites" className="py-12 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                Actualités
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                À la une
              </h2>
            </div>
            <Link
              href="/actualites"
              className="text-sm text-green-700 font-medium hover:underline shrink-0"
            >
              Toutes les actualités →
            </Link>
          </div>
          <FeaturedNewsCarousel articles={featuredNews} />
        </div>
      </section>

      {/* ── PARTENAIRES ── */}
      <section id="partenaires" className="py-12 sm:py-20 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                Partenaires
              </span>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">
                Ils nous soutiennent
              </h2>
            </div>
            <Link
              href="/partenaires"
              className="text-sm text-green-700 font-medium hover:underline shrink-0"
            >
              Voir tous →
            </Link>
          </div>
          <PartnersCarousel partners={partners} />
          <p className="mt-8 text-sm text-gray-400 text-center">
            Intéressé pour devenir partenaire ?{" "}
            <Link
              href="/contact"
              className="text-green-600 hover:underline font-medium"
            >
              Contactez-nous
            </Link>
          </p>
        </div>
      </section>

      {/* ── REJOINDRE CTA ── */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Prêt à nous rejoindre ?
          </h2>
          <p className="text-gray-500 mb-8">
            Que vous soyez débutant ou confirmé, il y a une place pour vous au{" "}
            {name}.
          </p>
          {social.clubRegistration ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              >
                <a
                  href={social.clubRegistration}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  S&apos;inscrire en ligne{" "}
                  <ArrowRight size={16} className="ml-2" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500">
                Pour vous inscrire, contactez-nous directement :
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {club?.phone && (
                  <Button
                    asChild
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                  >
                    <a href={`tel:${club.phone}`}>📞 {club.phone}</a>
                  </Button>
                )}
                {club?.email && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <a href={`mailto:${club.email}`}>✉️ {club.email}</a>
                  </Button>
                )}
                {!club?.phone && !club?.email && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="/contact">Nous contacter</Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <VisitorFooter />
    </div>
  );
}
