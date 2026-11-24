import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/apiClient', async () => (await import('./fakeApi')).fakeApiClient);

import { resetFakeDb, rows } from './fakeApi';
import { makeUser } from './fixtures';
import { createIssueWithRecommendations, getStoredRecommendations } from '../features/issues/services/issueService';
import type { NewIssue, StoredIssue, StoredRecommendation } from '../features/issues/services/issueService';
import { completeCaseReview } from '../features/issues/services/reviewService';
import {
  acceptRecommendation,
  decideRecommendation,
  markRecommendationDone,
} from '../features/recommendations/services/recommendationService';
import type { AppNotification } from '../features/notifications/types/notification.types';
import { getToday } from '../utils/dates';

const users = [
  makeUser({ id: 'u1', role: 'CHP', level: 'community', assignedLocations: ['Langas Community Unit'], fullName: 'Faith' }),
  makeUser({ id: 'u3', role: 'FACILITY_REPORTER', fullName: 'Mercy' }),
  makeUser({ id: 'u4', role: 'FACILITY_CHAIR', fullName: 'Dr Agnes' }),
  makeUser({ id: 'u7', role: 'COUNTY_SURVEILLANCE_LEAD', level: 'county', assignedLocations: ['Uasin Gishu County'], fullName: 'Daniel' }),
];

const locations = [
  { id: 'l1', name: 'Uasin Gishu County', type: 'county', parent: '' },
  { id: 'l2', name: 'Kapseret Sub-county', type: 'sub-county', parent: 'Uasin Gishu County' },
  { id: 'l3', name: 'Huruma Sub-County Hospital', type: 'facility', parent: 'Kapseret Sub-county' },
  { id: 'l4', name: 'Langas Community Unit', type: 'community-unit', parent: 'Huruma Sub-County Hospital' },
];

const issue: NewIssue = {
  setting: 'community',
  loggedAt: 'Langas Community Unit',
  issueType: 'maternal',
  dateOfBirth: '1995-01-01',
  gender: 'female',
  causeOfDeath: 'O72 · Postpartum haemorrhage',
  periodOfDeath: 'postpartum',
  gestationWeeks: '',
  daysPostpartum: '2',
  dateOfDeath: '2026-11-20',
  dateOfNotification: '2026-11-21',
  dateOfAudit: '2026-11-22',
  contributingFactors: ['3rd delay: Staff shortage'],
  comments: '',
  loggedById: 'u1',
};

const draft = {
  gap: '3rd delay: Staff shortage',
  responsiblePersonId: '',
  text: 'Roster a second midwife at night',
  classification: '' as const,
  level: '' as const,
  dateOfCompletion: '',
};

const notificationsFor = (id: string) => rows<AppNotification>('notifications').filter((item) => item.recipientId === id);
const recommendation = () => rows<StoredRecommendation>('recommendations')[0];

async function logAndReview(level: 'facility' | 'county', personId: string): Promise<StoredIssue> {
  const saved = await createIssueWithRecommendations(issue, [draft], getToday());
  const held = recommendation();
  await completeCaseReview({
    issue: saved,
    byUserId: 'u4',
    review: { reviewDate: getToday(), finalCause: saved.causeOfDeath },
    contributingFactors: saved.contributingFactors,
    existing: [held],
    edited: [
      {
        code: held.code,
        text: held.text,
        gap: held.gap,
        classification: 'immediate',
        dueDate: '2099-12-01',
        responsiblePersonId: personId,
        level,
      },
    ],
    added: [],
    users,
  });
  return saved;
}

describe('case flow: log → review → release → accept → done → close', () => {
  beforeEach(() => {
    resetFakeDb({ users, locations, issues: [], recommendations: [], recommendationEvents: [], notifications: [], issueEvents: [] });
  });

  it('holds the recommendation until the chair reviews the case', async () => {
    await createIssueWithRecommendations(issue, [draft], getToday());

    expect(recommendation()).toMatchObject({ status: 'Pending review', level: '', responsiblePersonId: '' });
    expect(notificationsFor('u4').map((item) => item.category)).toEqual(['review-needed']);
    expect(notificationsFor('u3')).toEqual([]);
  });

  it('runs a facility recommendation all the way to closed', async () => {
    await logAndReview('facility', 'u3');

    expect(recommendation()).toMatchObject({ status: 'Open', level: 'facility', responsiblePersonId: 'u3' });
    expect(notificationsFor('u3').map((item) => item.category)).toContain('assigned');
    expect(notificationsFor('u1').map((item) => item.category)).toEqual(['reviewed']);
    expect(rows<StoredIssue>('issues')[0].review?.completedById).toBe('u4');

    await acceptRecommendation(recommendation(), 'u3');
    expect(recommendation().status).toBe('In progress');

    await markRecommendationDone(recommendation(), 'u3', 'Roster updated', null, ['u4']);
    expect(recommendation().status).toBe('Pending approval');
    expect(notificationsFor('u4').map((item) => item.category)).toContain('approval-needed');

    await decideRecommendation(recommendation(), 'u4', 'approve', '');
    expect(recommendation().status).toBe('Closed');
    expect(notificationsFor('u3').map((item) => item.category)).toContain('approved');

    const actions = rows<{ action: string }>('recommendationEvents').map((event) => event.action);
    expect(actions).toEqual(['released', 'accepted', 'marked-done', 'approved']);
  });

  it('sends a county recommendation for acceptance first', async () => {
    await logAndReview('county', 'u7');

    expect(recommendation()).toMatchObject({ status: 'Pending acceptance', level: 'county', responsiblePersonId: 'u7' });
    expect(notificationsFor('u7').map((item) => item.category)).toContain('acceptance-needed');
  });

  it('reopens work the chair rejects', async () => {
    await logAndReview('facility', 'u3');
    await acceptRecommendation(recommendation(), 'u3');
    await markRecommendationDone(recommendation(), 'u3', 'Done', null, ['u4']);
    await decideRecommendation(recommendation(), 'u4', 'reject', 'No evidence attached');

    expect(recommendation().status).toBe('In progress');
    expect(notificationsFor('u3').map((item) => item.category)).toContain('rejected');
  });

  it('loads stored recommendations without changing ones that are on time', async () => {
    await logAndReview('facility', 'u3');
    const [loaded] = await getStoredRecommendations();
    expect(loaded.status).toBe('Open');
  });
});