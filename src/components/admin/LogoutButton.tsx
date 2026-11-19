'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Icon } from '@/components/Icons';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // On redirige quand même vers la page de connexion.
    }

    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout} disabled={loading}>
      {loading ? <Spinner /> : <Icon name="logout" size={16} />}
      Déconnexion
    </Button>
  );
}
