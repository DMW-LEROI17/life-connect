import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon, safeIcon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getCatalog, getFamilies } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tous les services au Cameroun',
  description:
    'Mécanicien, plombier, technicien, infirmier, taxi, traducteur… Trouvez un professionnel vérifié dans les 10 régions du Cameroun.',
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AidePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const famille = first(searchParams.famille);
  const q = first(searchParams.q)?.trim() ?? '';

  const [families, catalog] = await Promise.all([getFamilies(), getCatalog()]);

  const query = q.toLowerCase();

  const filtered = catalog.filter((category) => {
    if (famille && category.family_slug !== famille) return false;
    if (!query) return true;

    return (
      category.nom_fr.toLowerCase().includes(query) ||
      category.slug.includes(query) ||
      category.subcategories.some(
        (sub) =>
          sub.nom_fr.toLowerCase().includes(query) || sub.slug.includes(query),
      )
    );
  });

  const visibleFamilies = families.filter((family) =>
    filtered.some((category) => category.family_slug === family.slug),
  );

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu" className="container-lc max-w-5xl py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Accueil
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Quel service cherchez-vous ?
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Tous les besoins de la vie quotidienne, dans tout le Cameroun.
          Urgences, santé, maison, auto, numérique, famille, transport…
        </p>

        <form
          action="/aide"
          method="get"
          className="mt-5 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:flex-row"
        >
          <div className="relative flex-1">
            <Icon
              name="search"
              size={20}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher : plombier, moto, couture, infirmier…"
              className="input-lc pl-10"
              aria-label="Rechercher un service"
            />
          </div>
          {famille ? <input type="hidden" name="famille" value={famille} /> : null}
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-navy-900"
          >
            Rechercher
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link
            href="/aide"
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              !famille
                ? 'border-navy-900 bg-navy-900 text-white dark:border-white dark:bg-white dark:text-navy-900'
                : 'border-line bg-surface text-muted hover:text-ink'
            }`}
          >
            Toutes les familles
          </Link>
          {families.map((family) => (
            <Link
              key={family.slug}
              href={`/aide?famille=${family.slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                famille === family.slug
                  ? 'border-navy-900 bg-navy-900 text-white dark:border-white dark:bg-white dark:text-navy-900'
                  : 'border-line bg-surface text-muted hover:text-ink'
              }`}
            >
              {family.nom_fr}
            </Link>
          ))}
        </div>

        {visibleFamilies.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-semibold">Aucun service trouvé</p>
            <p className="mt-1 text-sm text-muted">
              Essayez un autre mot, ou choisissez « Autre besoin ».
            </p>
            <Link
              href="/aide/autre_besoin"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-navy-900 px-4 text-sm font-semibold text-white dark:bg-white dark:text-navy-900"
            >
              Décrire mon besoin
            </Link>
          </div>
        ) : null}

        <div className="mt-8 space-y-8">
          {visibleFamilies.map((family) => {
            const categories = filtered.filter(
              (category) => category.family_slug === family.slug,
            );

            return (
              <section key={family.slug}>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                    <Icon name={safeIcon(family.icon)} size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">{family.nom_fr}</h2>
                    {family.description ? (
                      <p className="text-xs text-muted">{family.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => {
                    const emergency = category.slug === 'urgences';
                    const href = emergency
                      ? '/urgence'
                      : `/aide/${category.slug}`;

                    return (
                      <Link
                        key={category.id}
                        href={href}
                        className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                          emergency
                            ? 'border-urgent-500/40 bg-urgent-50 hover:border-urgent-500 dark:bg-urgent-500/10'
                            : 'border-line bg-surface hover:border-teal-500/40'
                        }`}
                      >
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                            emergency
                              ? 'bg-urgent-500 text-white'
                              : 'bg-surface2 text-muted'
                          }`}
                        >
                          <Icon
                            name={emergency ? 'alert' : safeIcon(category.icon)}
                            size={18}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {category.nom_fr}
                          </span>
                          {category.description ? (
                            <span className="mt-0.5 block text-xs text-muted">
                              {category.description}
                            </span>
                          ) : null}
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {category.subcategories.slice(0, 3).map((sub) => (
                              <span
                                key={sub.id}
                                className="rounded-full bg-surface2 px-2 py-0.5 text-[10px] text-muted"
                              >
                                {sub.nom_fr}
                              </span>
                            ))}
                          </span>
                        </span>

                        <Icon
                          name="chevronRight"
                          size={16}
                          className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl bg-urgent-600 p-5 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold">C’est une urgence vitale ?</p>
              <p className="text-xs text-white/85">
                Appelez le 117 (police), le 118 (pompiers) ou le 119 (SAMU).
              </p>
            </div>
            <Link
              href="/urgence"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-urgent-600"
            >
              <Icon name="alert" size={16} />
              Écran urgence
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
