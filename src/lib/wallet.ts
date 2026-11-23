import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  WalletRow,
  WalletTransactionRow,
} from '@/types/db';

export async function getWallet(userId: string): Promise<WalletRow> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return (
      (data as WalletRow | null) ?? {
        user_id: userId,
        balance_fcfa: 0,
        updated_at: new Date().toISOString(),
      }
    );
  } catch {
    return {
      user_id: userId,
      balance_fcfa: 0,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function getWalletTransactions(
  userId: string,
): Promise<WalletTransactionRow[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data ?? []) as WalletTransactionRow[];
  } catch {
    return [];
  }
}

export async function getAdminWalletTransactions(): Promise<
  Array<
    WalletTransactionRow & {
      profiles: { full_name: string; email: string | null } | null;
    }
  >
> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('wallet_transactions')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(100);

    return (data ?? []) as Array<
      WalletTransactionRow & {
        profiles: { full_name: string; email: string | null } | null;
      }
    >;
  } catch {
    return [];
  }
}
