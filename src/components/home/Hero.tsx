import { Icon } from '@/components/Icons';
import { ButtonLink } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="container-lc pb-6 pt-8 sm:pb-10 sm:pt-14">
      <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
        </span>
        Douala · assistance locale
      </div>

      <h1 className="mt-5 max-w-2xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
        Une panne ? Un besoin ?
        <br />
        <span className="text-urgent-500">On vous connecte.</span>
      </h1>

      <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
        Un professionnel vérifié près de vous, en moins de 5 minutes. Sans
        compte. Juste votre numéro.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink href="/aide" size="lg" className="w-full sm:w-auto">
          <Icon name="alert" size={22} />
          J’AI BESOIN D’AIDE
        </ButtonLink>
        <p className="text-xs text-muted sm:text-sm">
          Gratuit pour le client. Vous payez directement le prestataire.
        </p>
      </div>
    </section>
  );
}
