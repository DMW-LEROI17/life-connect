const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Douala',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateTimeFormatter.format(date).replace(' ', ' à ');
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Douala',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Douala',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatFcfa(value: number | null | undefined): string {
  if (value == null) return '0 FCFA';
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return '—';
  if (seconds < 60) return `${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return rest > 0 ? `${minutes} min ${rest} s` : `${minutes} min`;
}

export function formatKm(km: number | null | undefined): string | null {
  if (km == null || Number.isNaN(km)) return null;
  if (km < 1) return 'moins de 1 km';
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function formatNote(
  note: number | string | null | undefined,
): string {
  if (note == null) return '—';
  const value = typeof note === 'string' ? Number(note) : note;
  if (Number.isNaN(value)) return '—';
  return value.toFixed(1).replace('.', ',');
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value)} %`;
}

export function shortRef(token: string): string {
  return token.slice(0, 8).toUpperCase();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
