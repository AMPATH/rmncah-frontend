import { useState } from 'react';
import { showToast } from '../../../components/shared/toast/toast';
import type { FormEvent } from 'react';
import { useParams } from 'react-router';
import ApprovalTrail from '../components/close-out/ApprovalTrail';
import ChairDecisionForm from '../components/close-out/ChairDecisionForm';
import MarkDoneForm from '../components/close-out/MarkDoneForm';
import type { ApprovalDecision, Decision, MarkDone } from '../types/action.types';

// Page 7: the work is marked done, then the facility MPDSR chair approves or rejects it.
function CloseOutPage() {
  const { id: actionId = '' } = useParams();

  const [remarks, setRemarks] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [decision, setDecision] = useState<Decision | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');

  function handleMarkDone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const markDone: MarkDone = { actionId, remarks, evidenceFileName };
    console.log('Mark as done:', markDone);
    showToast('Sent to the MPDSR chair for approval');
    setSubmitted(true);
  }

  function handleDecisionChange(newDecision: Decision | '') {
    setDecision(newDecision);
    // A reason only belongs to a rejection.
    if (newDecision !== 'reject') {
      setRejectionReason('');
    }
  }

  function handleDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (decision === '') {
      return;
    }
    const approval: ApprovalDecision = { actionId, decision, rejectionReason };
    console.log('Chair decision:', approval);
    showToast(decision === 'approve' ? 'Approved and closed' : 'Rejected and reopened', decision === 'approve' ? 'success' : 'warning');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Close out</h1>
      </div>

      <div className="form-columns">
        <MarkDoneForm
          remarks={remarks}
          submitted={submitted}
          onRemarksChange={setRemarks}
          onEvidenceChange={setEvidenceFileName}
          onSubmit={handleMarkDone}
        />

        <ChairDecisionForm
          decision={decision}
          rejectionReason={rejectionReason}
          onDecisionChange={handleDecisionChange}
          onRejectionReasonChange={setRejectionReason}
          onSubmit={handleDecision}
        />
      </div>

      <ApprovalTrail />
    </div>
  );
}

export default CloseOutPage;
