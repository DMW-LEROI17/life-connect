'use server';

import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth-user';
import { notifyUser } from '@/lib/notifications';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type WalletActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function createWalletTransactionAction(
  formData: FormData,
): Promise<WalletActionResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const type = String(formData.get('type') ?? 'recharge');
  const amount = Number(formData.get('amount') ?? 0);
  const provider = String(formData.get('provider') ?? 'orange_money');
  const phone = String(formData.get('phone') ?? '').trim();

  if (type !== 'recharge' && type !== 'retrait') {
    return { ok: false, error: 'Type d’opération invalide.' };
  }

  if (!Number.isInteger(amount) || amount < 100 || amount > 1_000_000) {
    return {
      ok: false,
      error: 'Montant invalide (entre 100 et 1 000 000 FCFA).',
    };
  }

  if (!['orange_money', 'mtn_momo'].includes(provider)) {
    return { ok: false, error: 'Opérateur invalide.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const admin = getSupabaseAdmin();

    if (type === 'retrait') {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance_fcfa')
        .eq('user_id', current.user.id)
        .maybeSingle();

      if (Number(wallet?.balance_fcfa ?? 0) < amount) {
        return { ok: false, error: 'Solde insuffisant pour ce retrait.' };
      }
    }

    const { error } = await admin.from('wallet_transactions').insert({
      user_id: current.user.id,
      type,
      amount,
      status: 'en_attente',
      provider,
      phone: phone || current.profile.phone,
      note:
        type === 'recharge'
          ? 'Recharge à confirmer par l’administrateur.'
          : 'Retrait à traiter par l’administrateur.',
    });

    if (error) {
      console.error('[createWalletTransactionAction]', error.message);
      return {
        ok: false,
        error:
          'L’opération n’a pas pu être enregistrée. Vérifiez que la migration V4 est exécutée.',
      };
    }

    await notifyUser({
      userId: current.user.id,
      type: 'paiement',
      title: type === 'recharge' ? 'Recharge en attente' : 'Retrait en attente',
      body: `${amount.toLocaleString('fr-FR')} FCFA — en attente de confirmation.`,
      link: '/wallet',
    });

    revalidatePath('/wallet');
    revalidatePath('/notifications');

    return {
      ok: true,
      message:
        'Opération enregistrée. Elle sera confirmée par l’administrateur ; aucun argent réel n’est débité automatiquement.',
    };
  } catch (error) {
    console.error('[createWalletTransactionAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
