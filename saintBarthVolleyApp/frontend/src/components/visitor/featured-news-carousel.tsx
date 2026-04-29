"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export interface FeaturedArticle {
  _id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: string | null;
  createdAt: string;
  authorId: { firstName: string; lastName: string } | null;
}

function fDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function ArticleCard({ article }: { article: FeaturedArticle }) {
  const excerpt = article.content.replace(/<[^>]*>/g, "").slice(0, 140);
  const date = article.publishedAt ?? article.createdAt;
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 bg-white overflow-hidden h-full flex flex-col">
      <div className="h-1 bg-gradient-to-r from-green-500 to-green-700 shrink-0" />
      <CardContent className="p-5 flex flex-col flex-1">
        <span className="inline-block mb-2 text-xs font-semibold text-green-700 uppercase tracking-wider">
          À la une
        </span>
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1">
          {excerpt}
          {article.content.replace(/<[^>]*>/g, "").length > 140 && "…"}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
          <span>{fDate(date)}</span>
          {article.authorId && (
            <span>
              {article.authorId.firstName} {article.authorId.lastName}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const PER_PAGE = 3;

export default function FeaturedNewsCarousel({
  articles,
}: {
  articles: FeaturedArticle[];
}) {
  const [page, setPage] = useState(0);

  if (articles.length === 0) {
    return (
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm bg-white overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-gray-100 to-green-100 flex items-center justify-center">
              <span className="text-4xl">🏐</span>
            </div>
            <CardContent className="p-4">
              <p className="text-xs text-gray-400 mb-1">Bientôt disponible</p>
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                Les actualités du club arrivent prochainement
              </h3>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPages = Math.ceil(articles.length / PER_PAGE);
  const visible = articles.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        {visible.map((article) => (
          <ArticleCard key={article._id} article={article} />
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
