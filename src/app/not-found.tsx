import Link from 'next/link';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="contenu"
        className="container-lc flex max-w-xl flex-col items-center py-20 text-center"
      >
        <p className="text-6xl font-black tracking-tight text-urgent-500">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold">Page introuvable</h1>
        <p className="mt-2 text-sm text-muted">
          Le lien est peut-être incomplet ou la page a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-urgent-500 px-5 text-sm font-semibold text-white"
        >
          Retour à l’accueil
        </Link>
      </main>
      <Footer />
    </>
  );
}
