import { apiFetch } from "@/lib/api";
import Navbar from "@/components/visitor/navbar";
import VisitorFooter from "@/components/visitor/visitor-footer";
import PageHero from "@/components/visitor/page-hero";
import { ExternalLink } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type Partner = {
  _id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
  priority: number;
};

function resolveImg(src?: string): string | null {
  if (!src) return null;
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads/")) return `${API}${src}`;
  return null;
}

async function getPartners(): Promise<Partner[]> {
  try {
    return (await apiFetch<Partner[]>("/api/partners")) ?? [];
  } catch {
    return [];
  }
}

export default async function PartenairesPage() {
  const partners = await getPartners();

  return (
    <div className="flex flex-col flex-1 bg-white text-gray-900 font-sans">
      <Navbar />

      <PageHero
        badge="Partenaires"
        title="Ils nous soutiennent"
        subtitle="Merci à nos partenaires et sponsors qui rendent possible l'activité du club."
      />

      <section className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {partners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-5">🤝</div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Aucun partenaire pour le moment
              </h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                Vous souhaitez soutenir le club et apparaître ici ?
                Contactez-nous !
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
              >
                Devenir partenaire
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {partners.map((partner) => {
                  const logoUrl = resolveImg(partner.logo);
                  return (
                    <div
                      key={partner._id}
                      className="group flex flex-col p-5 sm:p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all bg-white"
                    >
                      {/* Logo */}
                      <div className="h-16 sm:h-20 flex items-center justify-start mb-4">
                        {logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoUrl}
                            alt={partner.name}
                            className="max-h-full max-w-[140px] object-contain"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xl font-bold">
                            {partner.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        {partner.name}
                      </h3>

                      {partner.description && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-1">
                          {partner.description}
                        </p>
                      )}

                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-900 transition-colors"
                        >
                          Visiter le site
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div className="mt-12 sm:mt-16 py-10 px-6 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Vous souhaitez nous rejoindre ?
                </h2>
                <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
                  Intéressé pour devenir partenaire du club ? Contactez-nous
                  pour en savoir plus.
                </p>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 hover:bg-green-800 text-white font-semibold text-sm transition-colors"
                >
                  Nous contacter
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      <VisitorFooter />
    </div>
  );
}
