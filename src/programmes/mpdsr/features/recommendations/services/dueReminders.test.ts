import { describe, expect, it } from 'vitest';
import { dueReminderFor } from './dueReminders';
import type { StoredRecommendation } from '../../issues/services/issueService';

const today = '2026-11-22';

function recommendation(dueDate: string, status = 'Open', responsiblePersonId = 'u2'): StoredRecommendation {
  return { code: 'MP-1-R1', dueDate, status, responsiblePersonId } as StoredRecommendation;
}

describe('dueReminderFor', () => {
  it('reminds 7 days, 1 day and on the day', () => {
    expect(dueReminderFor(recommendation('2026-11-29'), today)).toBe('Due in 7 days: MP-1-R1 is due on 2026-11-29');
    expect(dueReminderFor(recommendation('2026-11-23'), today)).toBe('Due tomorrow: MP-1-R1 is due on 2026-11-23');
    expect(dueReminderFor(recommendation('2026-11-22'), today)).toBe('Due today: MP-1-R1 must be completed today');
  });

  it('stays quiet on other days, finished work and unassigned work', () => {
    expect(dueReminderFor(recommendation('2026-11-25'), today)).toBeNull();
    expect(dueReminderFor(recommendation('2026-11-23', 'Pending approval'), today)).toBeNull();
    expect(dueReminderFor(recommendation('2026-11-23', 'Pending review', ''), today)).toBeNull();
  });
});