import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Stars } from '@/components/ui/Stars';
import { labelFromSlug } from '@/lib/constants';
import { formatNote, initials } from '@/lib/format';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: 'Profil prestataire',
    description:
      'Prestataire vérifié sur LIFE CONNECT. Contact via la plateforme.',
    robots: { index: false, follow: false },
  };
}

export default async function ProviderProfilePage({
  params,
}: {
  params: { id: string };
}) {
  if (!UUID_RE.test(params.id)) notFound();

  const supabase = getSupabaseAdmin();

  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', params.id)
    .eq('statut', 'valide')
    .maybeSingle();

  if (error || !provider) notFound();

  const { data: services } = await supabase
    .from('provider_services')
    .select('subcategories(nom_fr, categories(nom_fr))')
    .eq('provider_id', params.id);

  const serviceNames = ((services ?? []) as unknown as Array<{
    subcategories:
      | { nom_fr: string; categories: { nom_fr: string } | null }
      | null;
  }>)
    .map((row) =>
      row.subcategories
        ? `${row.subcategories.nom_fr}${
            row.subcategories.categories
              ? ` — ${row.subcategories.categories.nom_fr}`
              : ''
          }`
        : null,
    )
    .filter(Boolean) as string[];

  const metier = provider.metier_nom || labelFromSlug(provider.metier);

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-2xl py-8">
        <Link
          href="/match"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          Recherche
        </Link>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-navy-900 text-lg font-bold text-white">
              {initials(provider.nom)}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {provider.nom}
              </h1>
              <p className="text-sm text-muted">
                {metier} · {provider.quartier}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-sm">
                <Stars value={Number(provider.note_moyenne)} size={14} />
                <span className="font-semibold">
                  {formatNote(provider.note_moyenne)}/5
                </span>
                <span className="text-muted">({provider.nombre_avis})</span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className="border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Profil vérifié
            </Badge>
            <Badge className="border-line bg-surface2 text-muted">
              {provider.disponible ? 'Disponible' : 'Indisponible'}
            </Badge>
            {provider.est_demo ? (
              <Badge className="border-violet-500/30 bg-violet-500/10 text-violet-500">
                DÉMO
              </Badge>
            ) : null}
          </div>

          {provider.specialite ? (
            <p className="mt-3 text-sm text-muted">{provider.specialite}</p>
          ) : null}

          {serviceNames.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Services
              </p>
              <ul className="mt-1 space-y-1 text-sm text-muted">
                {serviceNames.map((service) => (
                  <li key={service}>• {service}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 rounded-xl bg-surface2 p-4 text-xs text-muted">
            Le numéro de ce prestataire n’est pas public. Il est transmis au
            client uniquement après l’assignation d’une demande par
            l’administrateur. Cette règle protège la vie privée des deux parties.
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <ButtonLink href={`/aide/${provider.metier}`}>
              <Icon name="send" size={18} />
              Demander une intervention
            </ButtonLink>
            <ButtonLink href="/connect/nouveau" variant="outline">
              <Icon name="user" size={18} />
              Publier un besoin
            </ButtonLink>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
