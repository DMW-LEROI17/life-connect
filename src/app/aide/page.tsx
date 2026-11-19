import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CATEGORIES, CATEGORY_TONE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Quel est votre problème ?',
  description:
    'Choisissez une catégorie : mécanicien, dépanneur ou technicien à Douala.',
};

export default function AidePage() {
  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-3xl py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Accueil
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Quel est votre problème ?
        </h1>
        <p className="mt-2 text-sm text-muted">
          Choisissez la catégorie qui correspond à votre besoin. Vous pourrez
          préciser la panne juste après.
        </p>

        <div className="mt-6 grid gap-3">
          {CATEGORIES.map((category) => {
            const tone = CATEGORY_TONE[category.slug];

            return (
              <Link
                key={category.slug}
                href={`/aide/${category.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 shadow-soft transition-colors hover:border-teal-500/40"
              >
                <span
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${tone.iconBox}`}
                >
                  <Icon name={category.icon} size={24} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold">
                    {category.label}
                  </span>
                  <span className="block text-sm text-muted">
                    {category.description}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {category.problems.slice(0, 3).map((problem) => (
                      <span
                        key={problem}
                        className="rounded-full bg-surface2 px-2.5 py-1 text-xs text-muted"
                      >
                        {problem}
                      </span>
                    ))}
                  </span>
                </span>

                <Icon
                  name="chevronRight"
                  size={20}
                  className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            );
          })}
        </div>

        <p className="mt-6 rounded-xl border border-line bg-surface p-4 text-xs text-muted">
          Urgence vitale ? Appelez le 119 (ambulance), le 117 (police) ou le 118
          (pompiers). LIFE CONNECT met en relation avec des professionnels, il ne
          remplace pas les secours.
        </p>
      </main>

      <Footer />
    </>
  );
}
