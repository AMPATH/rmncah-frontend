import { useState } from 'react';
import { showToast } from '../../../components/shared/toast/toast';
import type { FormEvent } from 'react';
import { useParams } from 'react-router';
import type { Level, User } from '../../issues/types/issue.types';
import AcceptancePanel from '../components/accept-escalate/AcceptancePanel';
import EscalateForm from '../components/accept-escalate/EscalateForm';
import type { Escalation, EscalationAction } from '../types/action.types';

// Page 5: the responsible person accepts the recommendation, or moves it to another level.
function AcceptEscalatePage() {
  const { id: actionId = '' } = useParams();

  const [accepted, setAccepted] = useState(false);
  const [action, setAction] = useState<EscalationAction | ''>('');
  const [targetLevel, setTargetLevel] = useState<Level | ''>('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [reason, setReason] = useState('');
  const [moved, setMoved] = useState(false);

  // Users at the chosen level. Empty until the backend provides them.
  const users: User[] = [];

  function handleAccept() {
    console.log('Accept recommendation:', actionId);
    showToast('Recommendation accepted');
    setAccepted(true);
  }

  function handleMove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (action === '' || targetLevel === '') {
      return;
    }
    const escalation: Escalation = { actionId, action, targetLevel, targetPersonId, reason };
    console.log('Escalation to save:', escalation);
    showToast(action === 'escalate' ? 'Recommendation escalated' : 'Recommendation de-escalated');
    setMoved(true);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Accept or escalate</h1>
      </div>

      <div className="form-columns">
        <AcceptancePanel accepted={accepted} onAccept={handleAccept} />

        <EscalateForm
          action={action}
          targetLevel={targetLevel}
          targetPersonId={targetPersonId}
          reason={reason}
          users={users}
          moved={moved}
          onActionChange={setAction}
          onTargetLevelChange={setTargetLevel}
          onTargetPersonChange={setTargetPersonId}
          onReasonChange={setReason}
          onSubmit={handleMove}
        />
      </div>

      <p className="form-note">
        No acceptance in 3 days: auto-escalated to the PCN coordinator with the comment
        "Auto-escalated to PCN to reassign or action". They either reassign (the new person must
        accept) or accept it, and it moves to In progress on their desk.
      </p>
    </div>
  );
}

export default AcceptEscalatePage;
