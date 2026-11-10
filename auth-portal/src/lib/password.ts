export const passwordChecks = [
  { label: 'Entre 8 y 20 caracteres', test: (value: string) => value.length >= 8 && value.length <= 20 },
  { label: 'Una letra mayúscula', test: (value: string) => /[A-Z]/.test(value) },
  { label: 'Un número', test: (value: string) => /\d/.test(value) },
  { label: 'Un símbolo', test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
];

export type PasswordStrength = {
  label: 'Débil' | 'Media' | 'Buena' | 'Excelente';
  score: number;
};

export function getPasswordStrength(value: string): PasswordStrength {
  const score =
    passwordChecks.filter((check) => check.test(value)).length +
    Number(value.length >= 12);

  if (score <= 1) return { label: 'Débil', score };
  if (score <= 2) return { label: 'Media', score };
  if (score <= 4) return { label: 'Buena', score };
  return { label: 'Excelente', score };
}

export function isPasswordValid(value: string): boolean {
  return passwordChecks.every((check) => check.test(value));
}
