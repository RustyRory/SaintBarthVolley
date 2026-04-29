import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import VolunteersCarousel from "@/components/visitor/volunteers-carousel";
import type { Club } from "@/components/visitor/club-context";
import { Quote, Users, UserCheck } from "lucide-react";

type Season = { _id: string; name: string; status: string };
type ClubAssignment = {
  _id: string;
  memberId: { _id: string; firstName: string; lastName: string };
  role: string;
  customTitle: string;
  photo: string;
  displayOrder: number;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImageUrl(src: string | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

const ROLE_LABEL: Record<string, string> = {
  president: "Président",
  vice_president: "Vice-président",
  secretary: "Secrétaire",
  treasurer: "Trésorier",
  communication: "Responsable communication",
  sport_manager: "Responsable sportif",
  event_manager: "Responsable événements",
  equipment_manager: "Responsable matériel",
  referee: "Arbitre",
  volunteer: "Bénévole",
  other: "Autre",
};

async function getData() {
  const [club, seasons, members] = await Promise.all([
    apiFetch<Club>("/api/clubs/public").catch(() => null),
    apiFetch<Season[]>("/api/seasons").catch(() => [] as Season[]),
    apiFetch<{ _id: string }[]>("/api/members").catch(
      () => [] as { _id: string }[],
    ),
  ]);

  const sorted = (seasons ?? []).sort((a, b) =>
    a.status === "active" ? -1 : b.status === "active" ? 1 : 0,
  );
  const activeSeason =
    sorted.find((s) => s.status === "active") ?? sorted[0] ?? null;

  const [assignments, teams] = await Promise.all([
    activeSeason
      ? apiFetch<ClubAssignment[]>(
          `/api/club-assignments?seasonId=${activeSeason._id}&public=true`,
        ).catch(() => [] as ClubAssignment[])
      : Promise.resolve([] as ClubAssignment[]),
    activeSeason
      ? apiFetch<{ _id: string }[]>(
          `/api/teams?seasonId=${activeSeason._id}`,
        ).catch(() => [] as { _id: string }[])
      : Promise.resolve([] as { _id: string }[]),
  ]);

  let president: ClubAssignment | null = null;
  const staff: ClubAssignment[] = [];
  const volunteers: {
    _id: string;
    firstName: string;
    lastName: string;
    photo?: string;
  }[] = [];

  for (const a of assignments) {
    if (a.role === "volunteer") {
      volunteers.push({
        _id: a.memberId._id,
        firstName: a.memberId.firstName,
        lastName: a.memberId.lastName,
        photo: resolveImageUrl(a.photo) ?? undefined,
      });
    } else if (a.role === "president") {
      president = a;
    } else {
      staff.push(a);
    }
  }

  return {
    club,
    president,
    staff,
    volunteers,
    stats: {
      seasons: (seasons ?? []).length,
      teams: teams.length,
      members: (members ?? []).length,
    },
  };
}

export default async function ClubPage() {
  const { club, president, staff, volunteers, stats } = await getData();

  const name = club?.name ?? "Saint Barthélémy Volley-Ball";
  const subtitle = club?.subtitle ?? "Passion, Performance, Partage";
  const clubDescription =
    club?.clubDescription ??
    "Le club propose des entraînements pour tous les niveaux, des jeunes aux seniors, dans un esprit de partage et de progression.";
  const ownerDescription =
    club?.ownerDescription ??
    "Notre équipe dirigeante est composée de bénévoles passionnés, engagés pour le développement du volley-ball à Saint-Barthélemy.";
  const photoUrl = resolveImageUrl(club?.photo);

  const presidentPhotoUrl = president ? resolveImageUrl(president.photo) : null;
  const presidentInitials = president
    ? `${president.memberId.firstName.charAt(0)}${president.memberId.lastName.charAt(0)}`.toUpperCase()
    : "P";

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        <div className="relative h-56 sm:h-72 pt-16 flex items-center justify-center">
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {name}
            </h1>
            <p className="mt-2 text-green-300 font-medium">{subtitle}</p>
          </div>
        </div>
      </section>

      <div className="bg-green-900 py-3 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">
            Notre club
          </span>
        </div>
      </div>

      {/* ── CHIFFRES CLÉS ── */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              Notre histoire
            </span>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Le club en chiffres
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-2xl mx-auto">
            {[
              {
                value: stats.members > 0 ? `${stats.members}+` : "—",
                label: "Licenciés",
                sub: "membres actifs",
              },
              {
                value: stats.teams > 0 ? String(stats.teams) : "—",
                label: "Équipes",
                sub: "saison en cours",
              },
              {
                value: stats.seasons > 0 ? String(stats.seasons) : "—",
                label: "Saisons",
                sub: "d'histoire",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 p-4 sm:p-6 rounded-2xl bg-white border border-gray-100 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-green-700">
                  {stat.label}
                </p>
                <p className="text-xs text-gray-400 hidden sm:block">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRÉSENTATION ── */}
      <section className="py-10 sm:py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div>
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Qui sommes-nous
              </span>
              <h2 className="mt-1 text-2xl font-bold text-gray-900 mb-4">
                Le club
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {clubDescription}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Users,
                    label: "Tous niveaux",
                    sub: "Débutant à confirmé",
                  },
                  {
                    icon: UserCheck,
                    label: "Licenciés FFVB",
                    sub: "Fédération française",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <item.icon size={15} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-green-800">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`Photo du ${name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-center text-white">
                  <div>
                    <div className="text-5xl mb-3">🏐</div>
                    <p className="text-green-200 text-sm">{name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── MOT DU PRÉSIDENT ── */}
      <section className="py-10 sm:py-16 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
              Message
            </span>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              Mot du président
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <Quote
              size={28}
              className="text-green-400 mb-4"
              strokeWidth={1.5}
            />
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base italic whitespace-pre-line">
              {ownerDescription}
            </p>
            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-gray-100">
              {presidentPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={presidentPhotoUrl}
                  alt="Président"
                  className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-white shadow"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-green-700 flex items-center justify-center text-white font-bold shrink-0">
                  {presidentInitials}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {president
                    ? `${president.memberId.firstName} ${president.memberId.lastName}`
                    : "Le Président"}
                </p>
                <p className="text-xs text-gray-500">Président · {name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STAFF ── */}
      {staff.length > 0 && (
        <section className="py-10 sm:py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Organisation
              </span>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Notre équipe dirigeante
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {staff.map((a) => {
                const memberPhotoUrl = resolveImageUrl(a.photo);
                const initials =
                  `${a.memberId.firstName.charAt(0)}${a.memberId.lastName.charAt(0)}`.toUpperCase();
                const functionLabel =
                  a.role === "other" && a.customTitle
                    ? a.customTitle
                    : (ROLE_LABEL[a.role] ?? a.role);
                return (
                  <div
                    key={a._id}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-sm transition-all bg-white"
                  >
                    {memberPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={memberPhotoUrl}
                        alt={`${a.memberId.firstName} ${a.memberId.lastName}`}
                        className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-white shadow"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-base font-bold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {a.memberId.firstName} {a.memberId.lastName}
                      </p>
                      <p className="text-xs text-green-700 font-medium truncate">
                        {functionLabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── BÉNÉVOLES ── */}
      {volunteers.length > 0 && (
        <section className="py-10 sm:py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Communauté
              </span>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Nos bénévoles
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Merci à tous ceux qui donnent de leur temps pour le club.
              </p>
            </div>
            <VolunteersCarousel volunteers={volunteers} />
          </div>
        </section>
      )}

      {/* ── CARTE ── */}
      {club?.address && (
        <section className="py-10 sm:py-16 bg-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                Où nous trouver
              </span>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Notre adresse
              </h2>
              <p className="mt-1 text-sm text-gray-500">{club.address}</p>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-64 sm:h-80">
              <iframe
                title="Localisation du club"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(club.address)}&output=embed&z=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      <VisitorFooter />
    </div>
  );
}
