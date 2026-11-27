/**
 * Filtre les comptes de démonstration encore présents dans certaines bases
 * de test. L'admin continue de les voir, mais le public ne les affiche plus.
 */
export function isDemoText(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  return (
    normalized.startsWith('demo') ||
    normalized === 'dmw' ||
    normalized.startsWith('dmw ') ||
    normalized.startsWith('test ') ||
    normalized.startsWith('exemple ')
  );
}

export function filterDemoRows<T>(
  rows: T[],
  getName: (row: T) => string | null | undefined,
): T[] {
  return rows.filter((row) => !isDemoText(getName(row)));
}
