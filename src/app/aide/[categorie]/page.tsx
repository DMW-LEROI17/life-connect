import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RequestForm } from '@/components/request/RequestForm';
import { CATEGORIES, CATEGORY_TONE, getCategory } from '@/lib/constants';

type PageProps = {
  params: { categorie: string };
};

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ categorie: category.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = getCategory(params.categorie);

  return {
    title: category ? `Aide ${category.label}` : 'Demander de l’aide',
    description: category?.description,
  };
}

export default function CategoriePage({ params }: PageProps) {
  const category = getCategory(params.categorie);

  if (!category) {
    notFound();
  }

  const tone = CATEGORY_TONE[category.slug];

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-xl py-8">
        <Link
          href="/aide"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Changer de catégorie
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <span
            className={`grid h-12 w-12 place-items-center rounded-xl ${tone.iconBox}`}
          >
            <Icon name={category.icon} size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {category.label}
            </h1>
            <p className="text-sm text-muted">{category.short}</p>
          </div>
        </div>

        <div className="mt-6">
          <RequestForm category={category} />
        </div>
      </main>

      <Footer />
    </>
  );
}
