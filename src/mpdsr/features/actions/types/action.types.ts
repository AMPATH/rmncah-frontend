import type { Level } from '../../issues/types/issue.types';

export type EscalationAction = 'escalate' | 'de-escalate';

// Moving a recommendation to another level (page 5).
export interface Escalation {
  actionId: string;
  action: EscalationAction;
  targetLevel: Level;
  targetPersonId: string;
  reason: string;
}

// The PCN coordinator handing an overdue recommendation to someone new (page 6).
export interface Reassignment {
  newResponsiblePersonId: string;
  newCompletionDate: string;
  reason: string;
}

// The person holding the recommendation marking it done (page 7).
export interface MarkDone {
  actionId: string;
  remarks: string;
  evidenceFileName: string;
}

export type Decision = 'approve' | 'reject';

// The facility MPDSR chair's decision on a completed recommendation (page 7).
export interface ApprovalDecision {
  actionId: string;
  decision: Decision;
  rejectionReason: string;
}
