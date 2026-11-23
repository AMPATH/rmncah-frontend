export function initialsOf(fullName: string): string {
  const words = fullName
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words.length > 1 ? words[words.length - 1][0] : '')).toUpperCase() || '?';
}