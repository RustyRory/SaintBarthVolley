"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolveImg(src?: string): string | null {
  if (!src || src.includes("default_")) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

export interface Partner {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
}

function PartnerCard({ partner }: { partner: Partner }) {
  const logo = resolveImg(partner.logo);
  const inner = (
    <div className="h-24 sm:h-28 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-2 px-4 hover:border-green-300 hover:shadow-sm transition-all">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={partner.name}
          className="max-h-14 max-w-[120px] object-contain"
        />
      ) : (
        <span className="text-sm font-semibold text-gray-500 text-center leading-tight">
          {partner.name}
        </span>
      )}
      {logo && (
        <span className="text-xs text-gray-400 truncate max-w-full">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.website) {
    return (
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

const PER_PAGE = 4;

export default function PartnersCarousel({
  partners,
}: {
  partners: Partner[];
}) {
  const [page, setPage] = useState(0);

  if (partners.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 sm:h-28 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-300 text-xs font-medium"
          >
            Partenaire {i}
          </div>
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(partners.length / PER_PAGE);
  const visible = partners.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visible.map((p) => (
          <PartnerCard key={p._id} partner={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Précédent"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page
                    ? "w-6 bg-green-600"
                    : "w-2 bg-gray-200 hover:bg-gray-300"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="p-2 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
