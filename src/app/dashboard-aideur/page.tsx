import type { Metadata } from 'next';
import Link from 'next/link';

import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Icon } from '@/components/Icons';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { requireUser } from '@/lib/auth-user';
import { PROVIDER_STATUS_LABELS, STATUS_LABELS } from '@/lib/constants';
import { formatDateTime, shortRef } from '@/lib/format';
import { formatCmPhone, normalizeCmPhone, waNumber } from '@/lib/phone';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { ProviderRow, RequestStatus } from '@/types/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tableau de bord aideur — LIFE CONNECT',
  robots: { index: false, follow: false },
};

interface AssignedRequest {
  id: string;
  token: string;
  probleme: string;
  quartier: string;
  statut: RequestStatus;
  cree_le: string;
  tel_client: string;
  provider_access_token: string | null;
  is_emergency: boolean;
}

export default async function DashboardAideurPage() {
  const current = await requireUser('/dashboard-aideur');
  const phone =
    normalizeCmPhone(current.profile.phone ?? '') ||
    normalizeCmPhone(current.user.phone ?? '');
  const admin = getSupabaseAdmin();

  let provider: ProviderRow | null = null;

  if (phone) {
    const { data } = await admin
      .from('providers')
      .select('*')
      .eq('whatsapp', phone)
      .order('cree_le', { ascending: false })
      .limit(1)
      .maybeSingle();

    provider = (data as ProviderRow | null) ?? null;
  }

  let requests: AssignedRequest[] = [];

  if (provider) {
    const { data } = await admin
      .from('requests')
      .select(
        'id, token, probleme, quartier, statut, cree_le, tel_client, provider_access_token, is_emergency',
      )
      .eq('provider_id', provider.id)
      .order('cree_le', { ascending: false })
      .limit(50);

    requests = (data ?? []) as AssignedRequest[];
  }

  const resolved = requests.filter((item) => item.statut === 'resolue').length;
  const active = requests.filter(
    (item) => item.statut === 'assignee' || item.statut === 'en_recherche',
  ).length;

  return (
    <>
      <Header />
      <main id="contenu" className="container-lc max-w-3xl py-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-300">
          ESPACE AIDEUR
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Mes missions assignées
        </h1>
        <p className="mt-1 text-sm text-muted">
          Les demandes que l’administrateur vous a confiées.
        </p>

        {!provider ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-6">
            <p className="font-semibold">Aucun profil aideur lié à ce compte</p>
            <p className="mt-2 text-sm text-muted">
              {phone
                ? `Aucun prestataire n’utilise le numéro ${formatCmPhone(phone)}.`
                : 'Ajoutez votre numéro WhatsApp dans vos paramètres, ou inscrivez-vous comme aideur.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/devenir-aideur"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-500 px-4 text-sm font-semibold text-white"
              >
                <Icon name="send" size={18} />
                Devenir aideur
              </Link>
              {!phone ? (
                <Link
                  href="/compte"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm font-semibold"
                >
                  Ajouter mon numéro
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-line bg-surface p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-bold">{provider.nom}</p>
                  <p className="text-xs text-muted">
                    {provider.metier_nom || provider.metier} · {provider.quartier}
                  </p>
                </div>
                <Badge className="border-teal-500/30 bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {PROVIDER_STATUS_LABELS[provider.statut] ?? provider.statut}
                </Badge>
              </div>

              {provider.statut !== 'valide' ? (
                <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-50 p-2.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  Votre profil est en attente de validation. Vous pouvez déjà
                  voir les missions assignées.
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-surface2 p-3">
                  <p className="text-[10px] uppercase text-muted">Assignées</p>
                  <p className="text-xl font-bold">{requests.length}</p>
                </div>
                <div className="rounded-xl bg-surface2 p-3">
                  <p className="text-[10px] uppercase text-muted">En cours</p>
                  <p className="text-xl font-bold">{active}</p>
                </div>
                <div className="rounded-xl bg-surface2 p-3">
                  <p className="text-[10px] uppercase text-muted">Résolues</p>
                  <p className="text-xl font-bold">{resolved}</p>
                </div>
              </div>
            </div>

            {requests.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
                Aucune mission assignée pour le moment. L’administrateur vous
                contactera sur WhatsApp.
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {requests.map((request) => (
                  <article
                    key={request.id}
                    className={`rounded-2xl border bg-surface p-4 ${
                      request.is_emergency
                        ? 'border-urgent-500/40'
                        : 'border-line'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge statut={request.statut} />
                        {request.is_emergency ? (
                          <Badge className="border-urgent-500/40 bg-urgent-500 text-white">
                            URGENCE
                          </Badge>
                        ) : null}
                        <span className="text-[10px] text-muted">
                          Réf. {shortRef(request.token)}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted">
                        {formatDateTime(request.cree_le)}
                      </span>
                    </div>

                    <p className="mt-2 font-semibold">{request.probleme}</p>
                    <p className="text-xs text-muted">
                      {request.quartier} · {STATUS_LABELS[request.statut]}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={`tel:${request.tel_client}`}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-teal-500 px-3 text-xs font-semibold text-white"
                      >
                        <Icon name="phone" size={15} />
                        {formatCmPhone(request.tel_client)}
                      </a>
                      <a
                        href={`https://wa.me/${waNumber(request.tel_client)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-bold text-[#04331A]"
                      >
                        <Icon name="whatsapp" size={15} />
                        WhatsApp
                      </a>
                      {request.provider_access_token ? (
                        <Link
                          href={`/mission/${request.provider_access_token}`}
                          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold"
                        >
                          <Icon name="mapPin" size={15} />
                          Partager ma position
                        </Link>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      <AutoRefresh intervalMs={10000} />
    </>
  );
}
