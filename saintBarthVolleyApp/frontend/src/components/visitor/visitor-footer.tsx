"use client";

import Link from "next/link";
import { useClub } from "./club-context";
import { MapPin, Phone, Mail } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

const quickLinks = [
  { href: "/", label: "Accueil" },
  { href: "/club", label: "Le Club" },
  { href: "/equipes", label: "Les Équipes" },
  { href: "/actualites", label: "Actualités" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

const FacebookIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg
    width="16"
    height="16"
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
);
const YoutubeIcon = () => (
  <svg
    width="16"
    height="16"
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
);

export default function VisitorFooter() {
  const club = useClub();
  const name = club?.name ?? "Saint Barthélémy Volley-Ball";
  const social = club?.social_links ?? {};
  const rawLogo = club?.logo;
  const logoUrl =
    rawLogo && !rawLogo.includes("default_")
      ? rawLogo.startsWith("http")
        ? rawLogo
        : rawLogo.startsWith("/uploads/")
          ? `${API}${rawLogo}`
          : null
      : null;

  const hasSocial = social.facebook || social.instagram || social.youtube;

  return (
    <footer className="bg-green-950 text-white mt-auto">
      {/* ── Corps du footer ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-8">
          {/* ── Identité ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-bold">SBV</span>
                )}
              </div>
              <span className="font-bold text-base leading-tight">{name}</span>
            </div>

            {club?.subtitle && (
              <p className="text-sm text-green-300/80 italic leading-relaxed">
                {club.subtitle}
              </p>
            )}

            {hasSocial && (
              <div className="flex items-center gap-2 flex-wrap">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
                  >
                    <YoutubeIcon />
                  </a>
                )}
                <a
                  href="https://www.sporteasy.net/shop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-3 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-xs font-semibold tracking-wide transition-colors"
                >
                  SportEasy
                </a>
              </div>
            )}
          </div>

          {/* ── Contact ── */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">
              Contact
            </h3>
            {club?.address && (
              <div className="flex items-start gap-2.5 text-green-100">
                <MapPin size={14} className="text-green-400 mt-0.5 shrink-0" />
                <span className="text-sm leading-relaxed">{club.address}</span>
              </div>
            )}
            {club?.phone && (
              <div className="flex items-center gap-2.5 text-green-100">
                <Phone size={14} className="text-green-400 shrink-0" />
                <a
                  href={`tel:${club.phone}`}
                  className="text-sm hover:text-white transition-colors"
                >
                  {club.phone}
                </a>
              </div>
            )}
            {club?.email && (
              <div className="flex items-center gap-2.5 text-green-100">
                <Mail size={14} className="text-green-400 shrink-0" />
                <a
                  href={`mailto:${club.email}`}
                  className="text-sm hover:text-white transition-colors break-all"
                >
                  {club.email}
                </a>
              </div>
            )}
            {!club?.address && !club?.phone && !club?.email && (
              <p className="text-sm text-green-300/50">
                Coordonnées prochainement.
              </p>
            )}
          </div>

          {/* ── Navigation ── */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-1">
              Navigation
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-green-200 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="h-px w-3 bg-green-500/50 group-hover:w-5 group-hover:bg-green-400 transition-all shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Copyright ── */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-green-300/60 text-center sm:text-left">
            © {new Date().getFullYear()} {name}. Tous droits réservés.
          </p>
          <p className="text-xs text-green-300/40">Fait avec ❤️ pour le club</p>
        </div>
      </div>
    </footer>
  );
}
