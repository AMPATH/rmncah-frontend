import type { StoredIssue } from '../../issues/services/issueService';
import type { Location } from '../../../auth/locations';
import { placesAbove } from '../../../auth/locations';
import { addDays } from '../../../utils/dates';

export type DateField = 'dateLogged' | 'dateOfDeath' | 'dateOfNotification';
export type PeriodKey = 'today' | 'this-week' | 'last-week' | 'this-month';
export type TrackedType = 'maternal' | 'perinatal' | 'near-miss';

export interface Period {
  key: PeriodKey;
  label: string;
  detail: string;
  from: string;
  to: string;
}

export interface FacilityRow {
  id: string;
  facility: string;
  subCounty: string;
  county: string;
  maternal: number;
  perinatal: number;
  nearMiss: number;
  total: number;
}

export const dateFields: { key: DateField; label: string }[] = [
  { key: 'dateLogged', label: 'Date logged' },
  { key: 'dateOfDeath', label: 'Date of death' },
  { key: 'dateOfNotification', label: 'Date of notification' },
];

export const trackedTypes: { type: TrackedType; label: string }[] = [
  { type: 'maternal', label: 'Maternal deaths' },
  { type: 'perinatal', label: 'Perinatal deaths' },
  { type: 'near-miss', label: 'Near misses' },
];

function parts(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function shortDate(isoDate: string) {
  return parts(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function periodsFor(today: string): Period[] {
  const monday = addDays(today, -((parts(today).getDay() + 6) % 7));
  const lastMonday = addDays(monday, -7);
  const lastSunday = addDays(monday, -1);
  const monthStart = `${today.slice(0, 7)}-01`;
  const monthName = parts(today).toLocaleDateString('en-GB', { month: 'long' });

  return [
    { key: 'today', label: 'Today', detail: 'Reported today', from: today, to: today },
    { key: 'this-week', label: 'This week', detail: 'Mon – today', from: monday, to: today },
    {
      key: 'last-week',
      label: 'Last week',
      detail: `${shortDate(lastMonday)} – ${shortDate(lastSunday)}`,
      from: lastMonday,
      to: lastSunday,
    },
    { key: 'this-month', label: 'This month', detail: monthName, from: monthStart, to: today },
  ];
}

// A near miss has no date of death, so it falls back to the date logged.
export function dateOf(issue: StoredIssue, field: DateField): string {
  return issue[field] || issue.dateLogged;
}

export function inPeriod(issue: StoredIssue, field: DateField, period: Period): boolean {
  const date = dateOf(issue, field);
  return date >= period.from && date <= period.to;
}

export function countIn(issues: StoredIssue[], type: TrackedType, field: DateField, period: Period): number {
  return issues.filter((issue) => issue.issueType === type && inPeriod(issue, field, period)).length;
}

export function facilityRows(
  issues: StoredIssue[],
  field: DateField,
  period: Period,
  locations: Location[]
): FacilityRow[] {
  const rows = new Map<string, FacilityRow>();

  for (const issue of issues) {
    if (!inPeriod(issue, field, period)) continue;
    const place = issue.loggedAt || 'Not recorded';
    let row = rows.get(place);
    if (!row) {
      const above = placesAbove(place, locations);
      row = {
        id: place,
        facility: place,
        subCounty: above.find((location) => location.type === 'sub-county')?.name ?? '—',
        county: above.find((location) => location.type === 'county')?.name ?? '—',
        maternal: 0,
        perinatal: 0,
        nearMiss: 0,
        total: 0,
      };
      rows.set(place, row);
    }
    if (issue.issueType === 'maternal') row.maternal += 1;
    if (issue.issueType === 'perinatal') row.perinatal += 1;
    if (issue.issueType === 'near-miss') row.nearMiss += 1;
    row.total += 1;
  }

  return [...rows.values()].sort((a, b) => b.total - a.total || a.facility.localeCompare(b.facility));
}