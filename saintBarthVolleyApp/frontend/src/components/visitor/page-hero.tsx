"use client";

import { useClub } from "./club-context";

interface PageHeroProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export default function PageHero({ badge, title, subtitle }: PageHeroProps) {
  useClub();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-green-900">
        <div className="relative h-64 sm:h-80 pt-16 flex items-center justify-center">
          <div className="relative z-10 text-center px-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-green-300 font-medium">{subtitle}</p>
            )}
          </div>
        </div>
      </section>

      <div className="bg-green-900 py-4 border-b border-green-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">
            {badge ?? title}
          </span>
        </div>
      </div>
    </>
  );
}
