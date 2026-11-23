import { Icon } from '@/components/Icons';
import { EMERGENCY_NUMBERS } from '@/lib/constants';

export function EmergencyNumbers({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <div
        className={`grid gap-2 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}
      >
        {EMERGENCY_NUMBERS.map((item) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/15"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
              <Icon name={item.icon} size={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl font-black leading-none">
                {item.number}
              </span>
              <span className="mt-1 block text-xs font-semibold">
                {item.label}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
