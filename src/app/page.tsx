import Link from 'next/link';

import { EmergencyNumbers } from '@/components/emergency/EmergencyNumbers';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Icon, safeIcon } from '@/components/Icons';
import { EmergencyBanner } from '@/components/layout/EmergencyBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ButtonLink } from '@/components/ui/Button';
import { getCatalog, getFamilies } from '@/lib/catalog';
import { getRegions } from '@/lib/geo';
import { getFeaturedProviders } from '@/lib/search';

export const dynamic = 'force-dynamic';

const TRUST = [
  {
    icon: 'shield' as const,
    title: 'Prestataires vérifiés',
    text: 'Chaque profil est validé par l’administrateur avant d’être proposé.',
  },
  {
    icon: 'user' as const,
    title: 'Sans compte',
    text: 'Un numéro suffit. Pas de mot de passe, pas d’application à installer.',
  },
  {
    icon: 'phone' as const,
    title: 'Paiement direct',
    text: 'Vous payez le prestataire directement, sans commission cachée.',
  },
];

export default async function HomePage() {
  const [families, catalog, regions, featuredProviders] = await Promise.all([
    getFamilies(),
    getCatalog(),
    getRegions(),
    getFeaturedProviders(),
  ]);

  const counts = new Map<string, number>();
  for (const category of catalog) {
    counts.set(category.family_slug, (counts.get(category.family_slug) ?? 0) + 1);
  }

  return (
    <>
      <Header />
      <EmergencyBanner />

      <main id="contenu">
        <section className="container-lc pt-8 pb-4 sm:pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            Cameroun · 10 régions · tous les besoins
          </div>

          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
            Tout le Cameroun.
            <br />
            <span className="text-urgent-500">Tous les besoins. Une solution.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
            Un professionnel vérifié près de vous, en moins de 5 minutes. Santé,
            maison, auto, numérique, famille, transport… Sans compte. Juste votre
            numéro.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/aide" size="lg" className="w-full sm:w-auto">
              <Icon name="search" size={22} />
              J’AI BESOIN D’AIDE
            </ButtonLink>
            <ButtonLink
              href="/urgence"
              size="lg"
              variant="outline"
              className="w-full border-urgent-500/40 text-urgent-600 sm:w-auto dark:text-urgent-400"
            >
              <Icon name="alert" size={22} />
              URGENCE
            </ButtonLink>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <Link href="/connect/nouveau" className="font-semibold text-teal-700 hover:underline dark:text-teal-300">
              Publier un besoin
            </Link>
            <Link href="/connect" className="hover:text-ink">
              Explorer les demandes
            </Link>
            <Link href="/match" className="hover:text-ink">
              Trouver par description
            </Link>
          </div>
        </section>

        <section className="container-lc py-4">
          <div className="grid gap-2 sm:grid-cols-3">
            <Link
              href="/connect"
              className="rounded-2xl border border-line bg-surface p-4 hover:border-teal-500/40"
            >
              <p className="text-sm font-bold">LIFE CONNECT</p>
              <p className="mt-1 text-xs text-muted">
                Publiez un besoin ou une offre, recevez des propositions.
              </p>
            </Link>
            <Link
              href="/match"
              className="rounded-2xl border border-line bg-surface p-4 hover:border-violet-500/40"
            >
              <p className="text-sm font-bold">LIFE MATCH</p>
              <p className="mt-1 text-xs text-muted">
                Décrivez votre besoin, on identifie les solutions réelles.
              </p>
            </Link>
            <Link
              href="/compte"
              className="rounded-2xl border border-line bg-surface p-4 hover:border-teal-500/40"
            >
              <p className="text-sm font-bold">Mon espace</p>
              <p className="mt-1 text-xs text-muted">
                Profil, demandes publiées et réponses envoyées.
              </p>
            </Link>
          </div>
        </section>

        <section className="container-lc py-5">
          <div className="rounded-3xl bg-urgent-600 p-5 text-white shadow-soft sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                  Urgence vitale
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Appelez d’abord les secours.
                </h2>
                <p className="mt-1 max-w-xl text-sm text-white/85">
                  Numéros officiels du Cameroun. LIFE CONNECT ne remplace pas la
                  police, les pompiers ni le SAMU.
                </p>
              </div>
              <ButtonLink
                href="/urgence"
                variant="secondary"
                className="shrink-0"
              >
                Écran urgence
                <Icon name="chevronRight" size={18} />
              </ButtonLink>
            </div>
            <div className="mt-4">
              <EmergencyNumbers compact />
            </div>
          </div>
        </section>

        <section className="container-lc py-5">
          <form
            action="/match"
            method="get"
            className="flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 shadow-soft sm:flex-row"
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
                placeholder="Décrivez votre besoin : plombier à Akwa, infirmière à Yaoundé…"
                className="input-lc pl-10"
                aria-label="Décrivez votre besoin"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-500/90"
            >
              Chercher
            </button>
          </form>
        </section>

        <section className="container-lc py-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold sm:text-2xl">
                Toutes les familles de services
              </h2>
              <p className="mt-1 text-sm text-muted">
                Choisissez une famille, puis le service précis.
              </p>
            </div>
            <Link
              href="/aide"
              className="hidden text-sm font-semibold text-teal-700 hover:underline sm:inline dark:text-teal-300"
            >
              Tout voir
            </Link>
          </div>

          {families.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-sm text-muted">
              Le catalogue n’est pas encore chargé. Exécutez les scripts SQL V2
              (05 à 10) puis rechargez la page.
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {families.map((family) => (
                <Link
                  key={family.slug}
                  href={
                    family.slug === 'urgence_sante'
                      ? '/urgence'
                      : `/aide?famille=${family.slug}`
                  }
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-teal-500/40"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-300">
                    <Icon name={safeIcon(family.icon)} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{family.nom_fr}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {counts.get(family.slug) ?? 0} catégorie
                      {(counts.get(family.slug) ?? 0) > 1 ? 's' : ''}
                    </span>
                    {family.description ? (
                      <span className="mt-1 hidden text-xs text-muted sm:block">
                        {family.description}
                      </span>
                    ) : null}
                  </span>
                  <Icon
                    name="chevronRight"
                    size={18}
                    className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        {regions.length > 0 ? (
          <section className="container-lc py-6">
            <h2 className="text-lg font-bold">Près de chez vous</h2>
            <p className="mt-1 text-sm text-muted">
              Les 10 régions du Cameroun. Votre quartier ou village peut être
              ajouté librement dans le formulaire.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {regions.map((region) => (
                <Link
                  key={region.id}
                  href={`/regions/${region.slug}`}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-teal-500/40 hover:text-ink"
                >
                  {region.nom}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredProviders.length > 0 ? (
          <section className="container-lc py-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Prestataires vérifiés</h2>
                <p className="mt-1 text-sm text-muted">
                  Des professionnels disponibles, notés par les clients.
                </p>
              </div>
              <Link
                href="/match"
                className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300"
              >
                Voir plus
              </Link>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                      {provider.nom
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{provider.nom}</p>
                      <p className="truncate text-[11px] text-muted">
                        {provider.metier_nom ?? provider.metier} ·{' '}
                        {provider.quartier}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px]">
                    <span className="font-bold">
                      {Number(provider.note_moyenne).toFixed(1).replace('.', ',')}
                    </span>
                    <span className="text-amber-500">★</span>
                    <span className="text-muted">
                      ({provider.nombre_avis} avis)
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <Link
                      href={`/prestataires/${provider.id}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-line px-2 text-[11px] font-semibold"
                    >
                      Profil
                    </Link>
                    <Link
                      href={`/aide/${provider.metier}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-lg bg-teal-500 px-2 text-[11px] font-semibold text-white"
                    >
                      Demander
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="container-lc py-6">
          <h2 className="text-xl font-bold">Tous les modules</h2>
          <p className="mt-1 text-sm text-muted">
            Un besoin. Une connexion. Une solution.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { href: '/market', label: 'MARKET', text: 'Produits' },
              { href: '/people', label: 'PEOPLE', text: 'Annuaire' },
              { href: '/community', label: 'COMMUNITY', text: 'Groupes' },
              { href: '/exchange', label: 'EXCHANGE', text: 'Compétences' },
              { href: '/radar', label: 'RADAR', text: 'Opportunités' },
              { href: '/match', label: 'LIFE AI', text: 'Recherche' },
            ].map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="rounded-2xl border border-line bg-surface p-3 shadow-soft transition-colors hover:border-teal-500/40"
              >
                <p className="text-[10px] font-black tracking-wide text-teal-600 dark:text-teal-300">
                  {module.label}
                </p>
                <p className="mt-1 text-xs text-muted">{module.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <HowItWorks />

        <section className="container-lc py-8">
          <div className="overflow-hidden rounded-3xl bg-navy-900 p-6 text-white sm:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Vous êtes prestataire ou aideur ?
                </h2>
                <p className="mt-2 max-w-lg text-sm text-white/80">
                  Mécanicien, plombier, technicien, infirmier, taxi, moto-taxi,
                  traducteur… Inscrivez vos services et vos zones d’intervention.
                  Vérification sous 24 h.
                </p>
              </div>
              <ButtonLink
                href="/prestataire"
                variant="secondary"
                className="shrink-0"
              >
                <Icon name="user" size={18} />
                Créer mon profil
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="container-lc py-8">
          <div className="grid gap-3 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400">
                  <Icon name={item.icon} size={20} />
                </span>
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
