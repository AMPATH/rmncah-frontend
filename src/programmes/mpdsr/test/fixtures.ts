// Small builders for tests: each returns a complete record, and a test only states
// the fields it cares about, e.g. makeRecommendation({ status: 'Overdue' }).
import type { User } from '../types/user.types';
import type { StoredIssue, StoredRecommendation } from '../features/issues/services/issueService';
import type { RecommendationEvent } from '../features/recommendations/services/recommendationService';

export function makeUser(fields: Partial<User> = {}): User {
  return {
    id: 'u1',
    fullName: 'Test User',
    cadre: 'Nurse',
    email: 'test.user@example.org',
    level: 'facility',
    assignedLocations: ['Huruma Sub-County Hospital'],
    role: 'FACILITY_REPORTER',
    ...fields,
  };
}

export function makeIssue(fields: Partial<StoredIssue> = {}): StoredIssue {
  return {
    id: 'i1',
    code: 'ISS-2026-0001',
    dateLogged: '2026-11-01',
    setting: 'facility',
    loggedAt: 'Huruma Sub-County Hospital',
    issueType: 'maternal',
    dateOfBirth: '',
    gender: '',
    causeOfDeath: '',
    periodOfDeath: '',
    gestationWeeks: '',
    daysPostpartum: '',
    dateOfDeath: '',
    dateOfNotification: '',
    dateOfAudit: '',
    contributingFactors: [],
    comments: '',
    ...fields,
  };
}

export function makeRecommendation(fields: Partial<StoredRecommendation> = {}): StoredRecommendation {
  return {
    id: 'r1',
    code: 'ISS-2026-0001-R1',
    issueId: 'i1',
    issueCode: 'ISS-2026-0001',
    gap: '',
    text: 'Roster a second midwife',
    responsiblePersonId: 'u1',
    classification: 'immediate',
    level: 'facility',
    dateOfCompletion: '2026-12-01',
    dueDate: '2026-12-01',
    status: 'Open',
    timesRedone: 0,
    dateLogged: '2026-11-01',
    ...fields,
  };
}

export function makeEvent(fields: Partial<RecommendationEvent> = {}): RecommendationEvent {
  return {
    id: 'e1',
    code: 'ISS-2026-0001-R1',
    at: '2026-11-02T09:00:00.000Z',
    byUserId: 'u1',
    action: 'accepted',
    fromStatus: 'Pending acceptance',
    toStatus: 'In progress',
    note: '',
    ...fields,
  };
}
