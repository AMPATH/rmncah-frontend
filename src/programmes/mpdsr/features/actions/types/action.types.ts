import type { Level } from '../../issues/types/issue.types';

export type EscalationAction = 'escalate' | 'de-escalate';

export interface Escalation {
  actionId: string;
  action: EscalationAction;
  targetLevel: Level;
  targetPersonId: string;
  reason: string;
}

export interface Reassignment {
  newResponsiblePersonId: string;
  newCompletionDate: string;
  reason: string;
}

export interface MarkDone {
  actionId: string;
  remarks: string;
  evidenceFileName: string;
}

export type Decision = 'approve' | 'reject';

export interface ApprovalDecision {
  actionId: string;
  decision: Decision;
  rejectionReason: string;
}
