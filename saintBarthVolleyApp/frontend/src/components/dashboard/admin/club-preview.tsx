"use client";

import Image from "next/image";

interface Club {
  name: string;
  subtitle: string;
  homeDescription: string;
  logo: string;
  photo: string;
}

export function ClubPreview({ club }: { club: Club }) {
  return (
    <div className="rounded-xl border overflow-hidden shadow-sm bg-white">
      {/* IMAGE */}
      <div className="h-48 bg-gray-200 overflow-hidden">
        {club.photo ? (
          <Image
            src={club.photo}
            alt="club"
            width={100}
            height={100}
            unoptimized
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Aucune image
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {club.logo && (
            <Image
              src={club.logo}
              alt="logo"
              width={100}
              height={100}
              unoptimized
              className="w-12 h-12 object-contain"
            />
          )}
          <div>
            <h2 className="font-bold text-lg">{club.name}</h2>
            <p className="text-sm text-gray-500">{club.subtitle}</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 line-clamp-4">
          {club.homeDescription}
        </p>

        <button className="mt-2 bg-black text-white text-sm py-2 rounded-lg">
          Voir le site
        </button>
      </div>
    </div>
  );
}
