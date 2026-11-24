export function WhatsAppAlert({
  href,
  token,
  probleme = '',
  quartier = '',
  clientName = null,
}: {
  href?: string;
  token?: string;
  probleme?: string;
  quartier?: string;
  clientName?: string | null;
}) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'https://life-connect-vert.vercel.app';
  const displayName = clientName?.trim();

  const message = [
    `Bonjour, un client a besoin de vous à ${quartier || 'votre zone'}.`,
    `Problème : ${probleme || 'demande LIFE CONNECT'}.`,
    displayName ? `Client : ${displayName}.` : '',
    `Cliquez ici pour voir les détails et accepter : ${appUrl}/suivi/${token}`,
  ]
    .filter(Boolean)
    .join(' ');

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
