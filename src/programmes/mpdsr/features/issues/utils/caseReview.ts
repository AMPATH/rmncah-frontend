export interface IssueReview {
  reviewDate: string;
  finalCause: string;
  maternalCondition: string;
  completedAt: string;
  completedById: string;
}

export const maternalConditions = [
  'M1 · Complications of placenta, cord and membranes',
  'M2 · Maternal complications of pregnancy',
  'M3 · Other complications of labour and delivery',
  'M4 · Maternal medical and surgical conditions',
  'M5 · No maternal condition identified',
];

export function isReviewed(issue: { review?: IssueReview }): boolean {
  return Boolean(issue.review?.completedAt);
}
