'use server';

import { randomUUID } from 'node:crypto';
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
      const message = error.message.toLowerCase();

      if (message.includes('email not confirmed')) {
        return {
          ok: false,
          error:
            'Votre e-mail n’est pas encore confirmé. Ouvrez le lien reçu par e-mail, puis reconnectez-vous.',
        };
      }

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
    const current = await getCurrentUser();
    const destination =
      next === '/compte' && current?.profile.role === 'professionnel'
        ? '/dashboard-aideur'
        : next;

    redirect(destination);
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
): Promise<AuthResult> {  const current = await getCurrentUser();

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

export async function updateSettingsAction(
  formData: FormData,
): Promise<AuthResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const language = String(formData.get('language') ?? 'fr');

  if (language !== 'fr' && language !== 'en') {
    return { ok: false, error: 'Langue invalide.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        notify_messages: formData.get('notify_messages') === 'on',
        notify_requests: formData.get('notify_requests') === 'on',
        notify_payments: formData.get('notify_payments') === 'on',
        language,
      })
      .eq('id', current.user.id);

    if (error) {
      console.error('[updateSettingsAction]', error.message);
      return { ok: false, error: 'Les paramètres n’ont pas pu être enregistrés.' };
    }

    revalidatePath('/parametres');
    revalidatePath('/compte');
    return { ok: true, message: 'Paramètres enregistrés.' };
  } catch (error) {
    console.error('[updateSettingsAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function changePasswordAction(
  formData: FormData,
): Promise<AuthResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) {
    return { ok: false, error: 'Le mot de passe doit contenir 8 caractères minimum.' };
  }

  if (password !== confirm) {
    return { ok: false, error: 'Les deux mots de passe ne correspondent pas.' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error('[changePasswordAction]', error.message);
      return { ok: false, error: 'Le mot de passe n’a pas pu être modifié.' };
    }

    return { ok: true, message: 'Mot de passe modifié.' };
  } catch (error) {
    console.error('[changePasswordAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<AuthResult> {
  const current = await getCurrentUser();
  if (!current) return { ok: false, error: 'Connectez-vous.' };

  const file = formData.get('avatar');

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Choisissez une image.' };
  }

  if (file.size > 1024 * 1024) {
    return { ok: false, error: 'Image trop lourde (1 Mo max).' };
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { ok: false, error: 'Format non accepté (JPEG, PNG ou WebP).' };
  }

  try {
    const supabase = createSupabaseServerClient();
    const extension = file.type.split('/')[1] ?? 'jpg';
    const path = `${current.user.id}/${randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error('[uploadAvatarAction]', uploadError.message);
      return { ok: false, error: 'L’image n’a pas pu être envoyée.' };
    }

    const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', current.user.id);

    if (error) {
      return { ok: false, error: 'Le profil n’a pas pu être mis à jour.' };
    }

    revalidatePath('/compte');
    return { ok: true, message: 'Photo de profil mise à jour.' };
  } catch (error) {
    console.error('[uploadAvatarAction]', error);
    return { ok: false, error: 'Le service est momentanément indisponible.' };
  }
}
