import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { ProviderActions } from '@/components/admin/ProviderActions';
import { ProviderStatusBadge } from '@/components/admin/StatusBadge';
import { Icon } from '@/components/Icons';
import { SetupNotice } from '@/components/SetupNotice';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/config';
import {
  getCategory,
  PROVIDER_STATUS_LABELS,
} from '@/lib/constants';
import {
  formatDate,
  formatNote,
  initials,
} from '@/lib/format';
import { formatCmPhone } from '@/lib/phone';
import {
  getAdminProviders,
  getAdminStats,
  getPendingProviderCount,
} from '@/lib/queries';
import { waLink } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Prestataires',
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <SetupNotice />
      </>
    );
  }

  const statut = first(searchParams.statut);

  const [providers, stats, pendingProviders] = await Promise.all([
    getAdminProviders(statut),
    getAdminStats(),
    getPendingProviderCount(),
  ]);

  return (
    <div className="min-h-dvh bg-bg">
      <AdminHeader />

      <main id="contenu" className="container-lc py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prestataires</h1>
          <p className="text-sm text-muted">
            Validez les profils avant de les proposer aux clients.
          </p>
        </div>

        <AdminTabs
          active="providers"
          pendingRequests={stats.en_attente}
          pendingProviders={pendingProviders}
        />

        <form
          method="get"
          action="/admin/prestataires"
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <select
            name="statut"
            defaultValue={statut ?? ''}
            className="select-lc h-10 w-auto min-w-44 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(PROVIDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-navy-900 px-4 text-xs font-semibold text-white dark:bg-white dark:text-navy-900"
          >
            <Icon name="search" size={16} />
            Filtrer
          </button>

          {statut ? (
            <Link
              href="/admin/prestataires"
              className="text-xs font-medium text-muted underline underline-offset-2 hover:text-ink"
            >
              Réinitialiser
            </Link>
          ) : null}
        </form>

        {providers.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
            <p className="font-semibold">Aucun prestataire dans ce filtre</p>
            <p className="mt-1 text-sm text-muted">
              Les nouvelles inscriptions apparaîtront ici.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 hidden overflow-hidden rounded-2xl border border-line bg-surface md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface2 text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Prestataire</th>
                    <th className="px-4 py-3 font-semibold">Métier</th>
                    <th className="px-4 py-3 font-semibold">Quartier</th>
                    <th className="px-4 py-3 font-semibold">WhatsApp</th>
                    <th className="px-4 py-3 font-semibold">Statut</th>
                    <th className="px-4 py-3 font-semibold">Note</th>
                    <th className="px-4 py-3 font-semibold">Inscrit</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {providers.map((provider) => {
                    const category = getCategory(provider.metier);

                    return (
                      <tr key={provider.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {provider.photo_url ? (
                              <Image
                                src={provider.photo_url}
                                alt=""
                                width={36}
                                height={36}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-900 text-[10px] font-bold text-white">
                                {initials(provider.nom)}
                              </span>
                            )}
                            <div>
                              <p className="font-semibold">{provider.nom}</p>
                              <p className="text-[11px] text-muted">
                                {provider.specialite || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {category?.label ?? provider.metier}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {provider.quartier}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <a
                            href={waLink(
                              provider.whatsapp,
                              `Bonjour ${provider.nom}, ici LIFE CONNECT – HELP ME.`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-2 hover:text-ink"
                          >
                            {formatCmPhone(provider.whatsapp)}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <ProviderStatusBadge statut={provider.statut} />
                            {provider.est_demo ? (
                              <Badge className="border-violet-500/30 bg-violet-500/10 text-violet-500">
                                DÉMO
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {formatNote(provider.note_moyenne)}/5
                          <span className="block text-[11px] text-muted">
                            {provider.nombre_avis} avis
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">
                          {formatDate(provider.cree_le)}
                        </td>
                        <td className="px-4 py-3">
                          <ProviderActions
                            providerId={provider.id}
                            statut={provider.statut}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-2 md:hidden">
              {providers.map((provider) => {
                const category = getCategory(provider.metier);

                return (
                  <div
                    key={provider.id}
                    className="rounded-2xl border border-line bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      {provider.photo_url ? (
                        <Image
                          src={provider.photo_url}
                          alt=""
                          width={44}
                          height={44}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-white">
                          {initials(provider.nom)}
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{provider.nom}</p>
                        <p className="text-xs text-muted">
                          {category?.label ?? provider.metier} ·{' '}
                          {provider.quartier}
                        </p>
                        <p className="text-xs text-muted">
                          {formatNote(provider.note_moyenne)}/5 ·{' '}
                          {provider.nombre_avis} avis
                        </p>
                      </div>
                      <ProviderStatusBadge statut={provider.statut} />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <a
                        href={waLink(
                          provider.whatsapp,
                          `Bonjour ${provider.nom}, ici LIFE CONNECT – HELP ME.`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-2"
                      >
                        {formatCmPhone(provider.whatsapp)}
                      </a>
                      <span className="text-muted">
                        {formatDate(provider.cree_le)}
                      </span>
                    </div>

                    <div className="mt-3">
                      <ProviderActions
                        providerId={provider.id}
                        statut={provider.statut}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <AutoRefresh />
    </div>
  );
}
