// Turns a Date into "YYYY-MM-DD" using the local date (not UTC).
export function toIsoDate(date: Date | undefined): string {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


export function getToday(): string {
  return toIsoDate(new Date());
}


export function daysBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}


export function yearsBetween(start: string, end: string): number {
  const [startYear, startMonth, startDay] = start.split('-').map(Number);
  const [endYear, endMonth, endDay] = end.split('-').map(Number);
  const birthdayNotYetReached =
    endMonth < startMonth || (endMonth === startMonth && endDay < startDay);
  return endYear - startYear - (birthdayNotYetReached ? 1 : 0);
}


export function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}
