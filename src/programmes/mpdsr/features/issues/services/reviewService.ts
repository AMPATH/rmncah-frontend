import { apiPatch } from '../../../api/apiClient';
import type { DraftRecommendation, User } from '../types/issue.types';
import type { StoredIssue, StoredRecommendation } from './issueService';
import { recordIssueEvent } from './issueEditService';
import type { IssueFieldChange } from './issueEditService';
import type { IssueReview } from '../utils/caseReview';
import {
  addRecommendationToIssue,
  cancelRecommendation,
  releaseRecommendation,
  reviewRecommendation,
  withdrawHeldRecommendation,
} from '../../recommendations/services/recommendationService';
import type { ReviewChanges } from '../../recommendations/services/recommendationService';

export interface ReviewedRecommendation extends ReviewChanges {
  code: string;
  removed: boolean;
}

export interface CaseReviewInput {
  issue: StoredIssue;
  byUserId: string;
  review: Omit<IssueReview, 'completedAt' | 'completedById'>;
  contributingFactors: string[];
  existing: StoredRecommendation[];
  edited: ReviewedRecommendation[];
  added: DraftRecommendation[];
  users: User[];
}

function joined(values: string[]) {
  return values.length > 0 ? values.join('; ') : '—';
}

export function recommendationChanges(original: StoredRecommendation, edited: ReviewedRecommendation, users: User[]) {
  const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? '—';
  if (edited.removed) {
    return [{ field: original.code, from: original.text, to: 'Removed (cancelled)' }];
  }
  const changes: IssueFieldChange[] = [];
  if (edited.text !== original.text) changes.push({ field: `${original.code} text`, from: original.text, to: edited.text });
  if (edited.gap !== original.gap) changes.push({ field: `${original.code} gap`, from: original.gap || '—', to: edited.gap });
  if (edited.classification !== original.classification) {
    changes.push({ field: `${original.code} classification`, from: original.classification, to: edited.classification });
  }
  if (edited.level !== original.level) {
    changes.push({ field: `${original.code} level`, from: original.level || '—', to: edited.level || '—' });
  }
  if (edited.dueDate !== original.dueDate) changes.push({ field: `${original.code} due date`, from: original.dueDate, to: edited.dueDate });
  if (edited.responsiblePersonId !== original.responsiblePersonId) {
    changes.push({
      field: `${original.code} responsible person`,
      from: original.responsiblePersonId ? nameOf(original.responsiblePersonId) : '—',
      to: nameOf(edited.responsiblePersonId),
    });
  }
  return changes;
}

export function reviewDifferences(input: Omit<CaseReviewInput, 'byUserId'>): IssueFieldChange[] {
  const { issue, review, contributingFactors, existing, edited, added, users } = input;
  const changes: IssueFieldChange[] = [];

  if (review.finalCause !== issue.causeOfDeath) {
    changes.push({ field: 'Cause of death', from: issue.causeOfDeath || '—', to: review.finalCause || '—' });
  }
  if (joined(contributingFactors) !== joined(issue.contributingFactors)) {
    changes.push({ field: 'Contributing factors', from: joined(issue.contributingFactors), to: joined(contributingFactors) });
  }
  if (review.maternalCondition) {
    changes.push({ field: 'Maternal condition', from: '—', to: review.maternalCondition });
  }
  for (const item of edited) {
    const original = existing.find((recommendation) => recommendation.code === item.code);
    if (original) changes.push(...recommendationChanges(original, item, users));
  }
  for (const draft of added) {
    changes.push({ field: 'New recommendation', from: '—', to: draft.text });
  }
  return changes;
}

export async function completeCaseReview(input: CaseReviewInput): Promise<StoredIssue> {
  const { issue, byUserId, review, contributingFactors, existing, edited, added, users } = input;
  const changes = reviewDifferences(input);

  const updated = await apiPatch<StoredIssue>(`/issues/${issue.id}`, {
    causeOfDeath: review.finalCause,
    contributingFactors,
    review: { ...review, completedAt: new Date().toISOString(), completedById: byUserId },
  });

  await recordIssueEvent({
    issueCode: issue.code,
    byUserId,
    action: 'reviewed',
    note: `Case review on ${review.reviewDate}`,
    changes,
  });

  for (const item of edited) {
    const original = existing.find((recommendation) => recommendation.code === item.code);
    if (!original) continue;
    const held = original.status === 'Pending review';
    if (item.removed) {
      await (held ? withdrawHeldRecommendation : cancelRecommendation)(original, byUserId, 'Removed in the case review');
      continue;
    }
    const itemChanges = recommendationChanges(original, item, users);
    const fields = {
      text: item.text,
      gap: item.gap,
      classification: item.classification,
      dueDate: item.dueDate,
      responsiblePersonId: item.responsiblePersonId,
      level: item.level,
    };
    if (held) {
      await releaseRecommendation(
        original,
        byUserId,
        fields,
        itemChanges.map((change) => change.field.replace(`${original.code} `, '')).join(', ')
      );
    } else if (itemChanges.length > 0) {
      await reviewRecommendation(original, byUserId, fields);
    }
  }

  const codes = existing.map((recommendation) => recommendation.code);
  for (const draft of added) {
    const saved = await addRecommendationToIssue(issue, draft, codes, false);
    codes.push(saved.code ?? '');
  }

  return updated;
}
