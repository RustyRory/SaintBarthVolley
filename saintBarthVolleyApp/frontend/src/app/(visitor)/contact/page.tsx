import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import PageHero from "@/components/visitor/page-hero";
import type { Club } from "@/components/visitor/club-context";
import { MapPin, Phone, Mail, ExternalLink, UserCheck } from "lucide-react";

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

export default async function ContactPage() {
  const club = await getClub();

  const name = club?.name ?? "Saint Barthélémy Volley-Ball";
  const email = club?.email ?? null;
  const phone = club?.phone ?? null;
  const address = club?.address ?? null;
  const social = club?.social_links ?? {};
  const logoUrl = resolveImg(club?.logo);

  const socialLinks = [
    social.instagram && {
      href: social.instagram,
      label: "Instagram",
      icon: (
        <svg
          width="18"
          height="18"
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
      ),
    },
    social.facebook && {
      href: social.facebook,
      label: "Facebook",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    social.youtube && {
      href: social.youtube,
      label: "YouTube",
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      ),
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <div className="flex flex-col flex-1 bg-white text-gray-900 font-sans">
      <Navbar />

      <PageHero
        badge="Contact"
        title="Nous contacter"
        subtitle="Une question ? N'hésitez pas à nous écrire ou nous appeler."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
          {/* ── Cards : identité + rejoindre ── */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Identité + coordonnées + réseaux */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-white flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "SBV"
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">
                    {name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Club de volley-ball · Saint-Barthélemy
                  </p>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="flex flex-col gap-2">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors group"
                  >
                    <Mail size={15} className="text-green-700 shrink-0" />
                    <span className="truncate">{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors"
                  >
                    <Phone size={15} className="text-green-700 shrink-0" />
                    <span>{phone}</span>
                  </a>
                )}
                {address && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 text-sm text-gray-600 hover:text-green-700 transition-colors"
                  >
                    <MapPin
                      size={15}
                      className="text-green-700 shrink-0 mt-0.5"
                    />
                    <span>{address}</span>
                  </a>
                )}
              </div>

              {email && (
                <a
                  href={`mailto:${email}?subject=Contact - ${name}`}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                >
                  <Mail size={15} />
                  Nous écrire
                </a>
              )}

              {socialLinks.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                    Suivez-nous
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map(({ href, label, icon }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-green-700 hover:text-white text-gray-700 text-sm font-medium transition-colors"
                      >
                        {icon}
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rejoindre */}
            <div className="p-6 rounded-2xl border border-gray-100 bg-white flex flex-col justify-between gap-5">
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-2">
                  Rejoindre le club
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Que vous soyez débutant ou confirmé, il y a une place pour
                  vous. Inscrivez-vous en ligne ou contactez-nous pour plus
                  d&apos;informations.
                </p>
              </div>
              {social.clubRegistration ? (
                <a
                  href={social.clubRegistration}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
                >
                  <UserCheck size={15} />
                  S&apos;inscrire en ligne
                </a>
              ) : (
                email && (
                  <a
                    href={`mailto:${email}?subject=Demande d'inscription - ${name}`}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
                  >
                    <Mail size={15} />
                    Nous contacter pour s&apos;inscrire
                  </a>
                )
              )}
            </div>
          </div>

          {/* ── Ligne 3 : carte Google Maps ── */}
          {address && (
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-white">
                <MapPin size={14} className="text-green-700" />
                <span className="text-sm font-medium text-gray-700">
                  {address}
                </span>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium transition-colors"
                >
                  Ouvrir <ExternalLink size={11} />
                </a>
              </div>
              <iframe
                title="Localisation du club"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`}
                width="100%"
                height="320"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </section>

      <VisitorFooter />
    </div>
  );
}
