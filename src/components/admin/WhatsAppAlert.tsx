import { Icon } from '@/components/Icons';

export function WhatsAppAlert({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 text-xs font-bold text-[#04331A] transition-colors hover:bg-[#1FBE5B]"
    >
      <Icon name="whatsapp" size={16} />
      Alerter
    </a>
  );
}
