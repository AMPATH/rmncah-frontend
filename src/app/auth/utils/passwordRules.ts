
export const PASSWORD_RULES = [
  { label: 'At least 12 characters', test: (p: string) => p.length >= 12 },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'A special character, such as ! or #', test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
  { label: 'No spaces', test: (p: string) => p !== '' && !/\s/.test(p) },
];

export const PASSWORD_MAX = 128;

export function passwordIsValid(password: string) {
  return password.length <= PASSWORD_MAX && PASSWORD_RULES.every((rule) => rule.test(password));
}


export function newPasswordProblem(password: string, confirm: string) {
  if (!passwordIsValid(password)) return 'password';
  if (confirm !== password) return 'confirm';
  return '';
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;