"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useClub } from "./club-context";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/club", label: "Club" },
  { href: "/equipes", label: "Équipes" },
  { href: "/actualites", label: "Actualités" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

const DARK_HERO_PATHS = [
  "/",
  "/club",
  "/actualites",
  "/equipes",
  "/partenaires",
  "/contact",
];

export default function Navbar() {
  const club = useClub();
  const name = club?.name ?? "Saint Barthélémy Volley-Ball";
  const boutiqueUrl = club?.social_links?.clubMerch || null;

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const rawLogo = club?.logo;
  const logoUrl =
    rawLogo && !rawLogo.includes("default_")
      ? rawLogo.startsWith("http")
        ? rawLogo
        : rawLogo.startsWith("/uploads/")
          ? `${API}${rawLogo}`
          : null
      : null;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const hasDarkHero = DARK_HERO_PATHS.includes(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparentDark = hasDarkHero && !scrolled;

  const linkClass = (href: string) => {
    const hasAnchor = href.includes("#");
    const base = href.split("#")[0];
    const isActive =
      !hasAnchor &&
      (base === "/"
        ? pathname === "/"
        : base !== "/" && pathname.startsWith(base));
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isTransparentDark
        ? isActive
          ? "text-white bg-white/15"
          : "text-white/85 hover:text-white hover:bg-white/10"
        : isActive
          ? "text-green-700 bg-green-50"
          : "text-gray-700 hover:text-green-700 hover:bg-green-50"
    }`;
  };

  const allLinks = boutiqueUrl
    ? [...NAV_LINKS, { href: boutiqueUrl, label: "Boutique", external: true }]
    : NAV_LINKS;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparentDark
          ? "bg-black/30 backdrop-blur-sm"
          : "bg-white shadow-sm border-b border-gray-100"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + nom */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="h-8 w-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:bg-green-800 transition-colors overflow-hidden">
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
            <span
              className={`font-semibold text-sm sm:text-base transition-colors ${
                isTransparentDark ? "text-white" : "text-gray-900"
              }`}
            >
              {name}
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-1">
            {allLinks.map((link) => (
              <li key={link.href + link.label}>
                {"external" in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass(link.href)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className={linkClass(link.href)}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile toggle */}
          <button
            className={`lg:hidden p-2 rounded-md transition-colors ${
              isTransparentDark
                ? "text-white hover:bg-white/10"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-2 shadow-lg">
            {allLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.href + link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
