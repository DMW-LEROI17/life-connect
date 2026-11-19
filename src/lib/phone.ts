export function normalizeCmPhone(input: string): string | null {
  if (!input) return null;

  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('237')) {
    digits = digits.slice(3);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  if (!/^6\d{8}$/.test(digits)) {
    return null;
  }

  return `+237${digits}`;
}

export function formatCmPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('237') ? digits.slice(3) : digits;

  if (local.length !== 9) return phone;

  return `+237 ${local.slice(0, 1)} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
}

export function waNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}
