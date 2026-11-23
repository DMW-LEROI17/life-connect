'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getAppUrl } from '@/lib/config';
import { getCurrentUser } from '@/lib/auth-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const ROLES = ['particulier', 'professionnel', 'commercant', 'entreprise'] as const;

type AuthResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  if (next.startsWith('/') && !next.startsWith('//')) return next;
  return '/compte';
}

function emailIsValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const role = String(formData.get('role') ?? 'particulier');
  const phone = String(formData.get('phone') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();

  if (fullName.length < 2 || fullName.length > 80) {
    return { ok: false, error: 'Entrez votre nom complet.' };
  }

  if (!emailIsValid(email)) {
    return { ok: false, error: 'Adresse e-mail invalide.' };
  }

  if (password.length < 8) {
    return {
      ok: false,
      error: 'Le mot de passe doit contenir au moins 8 caractères.',
    };
  }

  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    return { ok: false, error: 'Type de compte invalide.' };
  }

  let hasSession = false;

  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${getAppUrl()}/auth/callback?next=/compte`,
        data: {
          full_name: fullName,
          role,
          phone,
          city,
          country: 'Cameroun',
        },
      },
    });

    if (error) {
      console.error('[signUpAction]', error.message);

      if (error.message.toLowerCase().includes('already registered')) {
        return {
          ok: false,
          error: 'Un compte existe déjà avec cette adresse e-mail.',
        };
      }

      return { ok: false, error: 'Inscription impossible pour le moment.' };
    }

    hasSession = Boolean(data.session);
  } catch (error) {
    console.error('[signUpAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }

  if (!hasSession) {
    return {
      ok: true,
      message:
        'Compte créé. Vérifiez votre boîte e-mail pour confirmer votre adresse, puis connectez-vous.',
    };
  }

  redirect('/compte');
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = safeNext(formData.get('next'));

  if (!emailIsValid(email) || !password) {
    return { ok: false, error: 'Entrez votre e-mail et votre mot de passe.' };
  }

  let connected = false;

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[signInAction]', error.message);
      return {
        ok: false,
        error: 'E-mail ou mot de passe incorrect.',
      };
    }

    connected = true;
  } catch (error) {
    console.error('[signInAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }

  if (connected) {
    redirect(next);
  }

  return { ok: false, error: 'Connexion impossible.' };
}

export async function signOutAction() {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // On redirige quand même.
  }

  redirect('/');
}

export async function updateProfileAction(
  formData: FormData,
): Promise<AuthResult> {
  const current = await getCurrentUser();

  if (!current) {
    return { ok: false, error: 'Session expirée. Reconnectez-vous.' };
  }

  const fullName = String(formData.get('full_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();
  const country = String(formData.get('country') ?? 'Cameroun').trim();
  const bio = String(formData.get('bio') ?? '').trim();

  if (fullName.length < 2 || fullName.length > 80) {
    return { ok: false, error: 'Entrez votre nom complet.' };
  }

  if (bio.length > 600) {
    return { ok: false, error: 'La bio ne doit pas dépasser 600 caractères.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        city: city || null,
        country: country || 'Cameroun',
        bio: bio || null,
      })
      .eq('id', current.user.id);

    if (error) {
      console.error('[updateProfileAction]', error.message);
      return { ok: false, error: 'La mise à jour du profil a échoué.' };
    }

    revalidatePath('/compte');
    return { ok: true, message: 'Profil mis à jour.' };
  } catch (error) {
    console.error('[updateProfileAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
