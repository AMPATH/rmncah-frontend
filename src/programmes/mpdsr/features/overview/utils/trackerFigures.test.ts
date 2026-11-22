import { describe, expect, it } from 'vitest';
import { countIn, facilityRows, periodsFor } from './trackerFigures';
import type { StoredIssue } from '../../issues/services/issueService';
import type { Location } from '../../../auth/locations';

const today = '2026-11-20'; // a Friday

function issue(id: string, issueType: string, dateLogged: string, loggedAt: string, dateOfDeath = ''): StoredIssue {
  return { id, code: id, issueType, dateLogged, loggedAt, dateOfDeath } as StoredIssue;
}

const locations: Location[] = [
  { id: 'c', name: 'Uasin Gishu', type: 'county', parent: '' },
  { id: 's', name: 'Ainabkoi', type: 'sub-county', parent: 'Uasin Gishu' },
  { id: 'f', name: 'Moi TRH', type: 'facility', parent: 'Ainabkoi' },
];

describe('periodsFor', () => {
  it('starts the week on Monday and the month on the 1st', () => {
    const [day, week, lastWeek, month] = periodsFor(today);
    expect(day.from).toBe(today);
    expect(week.from).toBe('2026-11-16');
    expect(lastWeek.from).toBe('2026-11-09');
    expect(lastWeek.to).toBe('2026-11-15');
    expect(month.from).toBe('2026-11-01');
  });
});

describe('countIn', () => {
  const issues = [
    issue('1', 'maternal', '2026-11-20', 'Moi TRH'),
    issue('2', 'maternal', '2026-11-12', 'Moi TRH'),
    issue('3', 'perinatal', '2026-11-18', 'Moi TRH', '2026-11-10'),
  ];
  const [day, week, lastWeek] = periodsFor(today);

  it('counts by the chosen date', () => {
    expect(countIn(issues, 'maternal', 'dateLogged', day)).toBe(1);
    expect(countIn(issues, 'maternal', 'dateLogged', lastWeek)).toBe(1);
    expect(countIn(issues, 'perinatal', 'dateLogged', week)).toBe(1);
    expect(countIn(issues, 'perinatal', 'dateOfDeath', lastWeek)).toBe(1);
  });
});

describe('facilityRows', () => {
  it('groups by facility, fills sub-county and county, highest first', () => {
    const issues = [
      issue('1', 'maternal', '2026-11-20', 'Moi TRH'),
      issue('2', 'near-miss', '2026-11-19', 'Moi TRH'),
      issue('3', 'perinatal', '2026-11-18', 'Other place'),
    ];
    const rows = facilityRows(issues, 'dateLogged', periodsFor(today)[1], locations);
    expect(rows[0]).toMatchObject({ facility: 'Moi TRH', subCounty: 'Ainabkoi', county: 'Uasin Gishu', total: 2 });
    expect(rows[1]).toMatchObject({ facility: 'Other place', county: '—', perinatal: 1 });
  });
});