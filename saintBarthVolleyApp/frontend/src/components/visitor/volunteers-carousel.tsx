"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function resolvePhoto(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

type Volunteer = {
  _id: string;
  firstName: string;
  lastName: string;
  photo?: string;
};

interface Props {
  volunteers: Volunteer[];
}

const PER_PAGE = 4;

export default function VolunteersCarousel({ volunteers }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(volunteers.length / PER_PAGE);
  const visible = volunteers.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  if (volunteers.length === 0) return null;

  return (
    <div className="relative">
      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visible.map((v) => {
          const photoUrl = resolvePhoto(v.photo);
          const initials =
            `${v.firstName.charAt(0)}${v.lastName.charAt(0)}`.toUpperCase();
          return (
            <div
              key={v._id}
              className="flex flex-col items-center text-center gap-3"
            >
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={`${v.firstName} ${v.lastName}`}
                  className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold border-2 border-white shadow-md">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {v.firstName}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {v.lastName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-2 rounded-full transition-all ${
                  i === page
                    ? "w-6 bg-green-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
