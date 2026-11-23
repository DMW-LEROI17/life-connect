'use server';

import { revalidatePath } from 'next/cache';

import { isAdmin } from '@/lib/auth';
import { notifyUser } from '@/lib/notifications';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export type AdminWalletResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function confirmWalletTransactionAction(
  transactionId: string,
): Promise<AdminWalletResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Accès administrateur requis.' };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: transaction } = await admin
      .from('wallet_transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (!transaction || transaction.status !== 'en_attente') {
      return { ok: false, error: 'Transaction introuvable ou déjà traitée.' };
    }

    const { data: wallet } = await admin
      .from('wallets')
      .select('balance_fcfa')
      .eq('user_id', transaction.user_id)
      .maybeSingle();

    const balance = Number(wallet?.balance_fcfa ?? 0);

    if (transaction.type === 'retrait' && balance < transaction.amount) {
      return { ok: false, error: 'Solde insuffisant pour confirmer ce retrait.' };
    }

    const nextBalance =
      transaction.type === 'recharge'
        ? balance + transaction.amount
        : balance - transaction.amount;

    await admin.from('wallets').upsert(
      {
        user_id: transaction.user_id,
        balance_fcfa: nextBalance,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );

    await admin
      .from('wallet_transactions')
      .update({ status: 'confirme' })
      .eq('id', transactionId);

    await notifyUser({
      userId: transaction.user_id,
      type: 'paiement',
      title:
        transaction.type === 'recharge'
          ? 'Recharge confirmée'
          : 'Retrait confirmé',
      body: `${transaction.amount.toLocaleString('fr-FR')} FCFA.`,
      link: '/wallet',
    });

    revalidatePath('/admin/paiements');
    revalidatePath('/wallet');
    return { ok: true, message: 'Transaction confirmée.' };
  } catch (error) {
    console.error('[confirmWalletTransactionAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function cancelWalletTransactionAction(
  transactionId: string,
): Promise<AdminWalletResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Accès administrateur requis.' };
  }

  try {
    const admin = getSupabaseAdmin();
    const { data: transaction } = await admin
      .from('wallet_transactions')
      .select('*')
      .eq('id', transactionId)
      .maybeSingle();

    if (!transaction || transaction.status !== 'en_attente') {
      return { ok: false, error: 'Transaction introuvable ou déjà traitée.' };
    }

    await admin
      .from('wallet_transactions')
      .update({ status: 'annule' })
      .eq('id', transactionId);

    await notifyUser({
      userId: transaction.user_id,
      type: 'paiement',
      title: 'Opération annulée',
      body: `${transaction.amount.toLocaleString('fr-FR')} FCFA — annulée par l’administrateur.`,
      link: '/wallet',
    });

    revalidatePath('/admin/paiements');
    revalidatePath('/wallet');
    return { ok: true, message: 'Transaction annulée.' };
  } catch (error) {
    console.error('[cancelWalletTransactionAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
