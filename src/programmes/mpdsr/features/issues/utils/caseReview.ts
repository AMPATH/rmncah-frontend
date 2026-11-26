export interface IssueReview {
  reviewDate: string;
  finalCause: string;
  // Older reviews may have recorded a maternal condition; new reviews do not.
  maternalCondition?: string;
  completedAt: string;
  completedById: string;
}

export function isReviewed(issue: { review?: IssueReview }): boolean {
  return Boolean(issue.review?.completedAt);
}
