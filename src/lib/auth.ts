import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_COOKIE, verifySessionToken } from '@/lib/session';

export async function isAdmin(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    redirect('/admin/login');
  }
}
