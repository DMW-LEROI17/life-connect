import { getAppUrl } from '@/lib/config';

export function WhatsAppAlert({
  href,
  token,
  categorie = '',
  quartier = '',
  region = null,
}: {
  href?: string;
  token?: string;
  categorie?: string;
  quartier?: string;
  region?: string | null;
}) {
  const message = [
    `Bonjour, un client a besoin d'un ${categorie} à ${quartier}${
      region ? ` (${region})` : ''
    }.`,
    `Détails : ${getAppUrl()}/suivi/${token}`,
  ].join(' ');

  const link =
    href ??
    (token
      ? `https://wa.me/?text=${encodeURIComponent(message)}`
      : null);

  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-[11px] font-bold text-[#04331A] hover:bg-[#1FBE5B]"
    >
      Alerter sur WhatsApp
    </a>
  );
}
