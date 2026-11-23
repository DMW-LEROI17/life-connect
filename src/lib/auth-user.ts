import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

import { isSupabaseAuthConfigured } from '@/lib/config';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProfileRow } from '@/types/db';

export async function getCurrentUser(): Promise<{
  user: User;
  profile: ProfileRow;
} | null> {
  if (!isSupabaseAuthConfigured()) return null;

  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !profile) {
      // Compte créé avant le trigger, ou trigger non exécuté :
      // on répare le profil côté serveur, avec le rôle le plus bas.
      try {
        const admin = getSupabaseAdmin();
        const { data: repaired } = await admin
          .from('profiles')
          .insert({
            id: user.id,
            full_name:
              (user.user_metadata?.full_name as string | undefined) ||
              user.email?.split('@')[0] ||
              'Membre LIFE CONNECT',
            role: 'particulier',
            email: user.email,
            phone: user.phone,
            country: 'Cameroun',
          })
          .select('*')
          .single();

        if (repaired) {
          return { user, profile: repaired as ProfileRow };
        }
      } catch {
        // La table profiles n'existe pas encore.
      }

      return null;
    }

    if ((profile as ProfileRow).is_suspended) {
      return null;
    }

    return { user, profile: profile as ProfileRow };
  } catch {
    return null;
  }
}

export async function requireUser(nextPath: string) {
  const current = await getCurrentUser();

  if (!current) {
    redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  }

  return current;
}
