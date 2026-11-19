'use client';

import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="contenu"
      className="container-lc flex max-w-xl flex-col items-center py-20 text-center"
    >
      <p className="text-5xl font-black text-urgent-500">Oups</p>
      <h1 className="mt-3 text-2xl font-bold">Une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted">
        Réessayez dans un instant. Si le problème persiste, contactez
        l’administrateur sur WhatsApp.
      </p>
      <Button className="mt-6" onClick={reset}>
        Réessayer
      </Button>
    </main>
  );
}
