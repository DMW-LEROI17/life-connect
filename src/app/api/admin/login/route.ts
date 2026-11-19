import { createHash, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  createSessionToken,
} from '@/lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json(
          { error: 'Origine non autorisée.' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Origine non autorisée.' },
        { status: 403 },
      );
    }
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'inconnu';

  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const password =
    typeof (body as { password?: unknown })?.password === 'string'
      ? ((body as { password: string }).password ?? '')
      : '';

  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json(
      { error: 'Administration non configurée (ADMIN_PASSWORD manquant).' },
      { status: 500 },
    );
  }

  const providedHash = createHash('sha256').update(password).digest();
  const expectedHash = createHash('sha256').update(expected).digest();

  if (!timingSafeEqual(providedHash, expectedHash)) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return NextResponse.json(
      { error: 'Mot de passe incorrect.' },
      { status: 401 },
    );
  }

  try {
    const token = await createSessionToken();
    const response = NextResponse.json({ ok: true });

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('[admin/login]', error);
    return NextResponse.json(
      { error: 'Session impossible : vérifiez AUTH_SECRET.' },
      { status: 500 },
    );
  }
}
