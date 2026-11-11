import { useState } from 'react';
import { showToast } from '../../../components/shared/toast/toast';
import type { FormEvent } from 'react';
import type { User } from '../../issues/types/issue.types';
import { getToday } from '../../issues/utils/dates';
import OverdueRecord from '../components/overdue/OverdueRecord';
import ReassignForm from '../components/overdue/ReassignForm';
import type { Reassignment } from '../types/action.types';

// Page 6: an overdue recommendation goes to the PCN coordinator, who reassigns it.
function OverdueReassignPage() {
  const [newResponsiblePersonId, setNewResponsiblePersonId] = useState('');
  const [newCompletionDate, setNewCompletionDate] = useState('');
  const [reason, setReason] = useState('');
  const [timesRedone, setTimesRedone] = useState(0);
  const [showErrors, setShowErrors] = useState(false);

  // Users to choose from. Empty until the backend provides them.
  const users: User[] = [];
  const today = getToday();

  function handleReassign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newCompletionDate === '') {
      setShowErrors(true);
      return;
    }
    const reassignment: Reassignment = { newResponsiblePersonId, newCompletionDate, reason };
    console.log('Reassignment to save:', reassignment);
    showToast('Recommendation reassigned');

    // Each reassignment counts as one more "redo".
    setTimesRedone((current) => current + 1);
    setNewResponsiblePersonId('');
    setNewCompletionDate('');
    setReason('');
    setShowErrors(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Overdue and reassign</h1>
      </div>

      <p className="form-note">
        Due date passed before completion. Status becomes Overdue and it is assigned to the PCN
        coordinator from the facility escalation matrix.
      </p>

      <div className="form-columns">
        <OverdueRecord timesRedone={timesRedone} />

        <ReassignForm
          newResponsiblePersonId={newResponsiblePersonId}
          newCompletionDate={newCompletionDate}
          reason={reason}
          users={users}
          today={today}
          showErrors={showErrors}
          onPersonChange={setNewResponsiblePersonId}
          onCompletionDateChange={setNewCompletionDate}
          onReasonChange={setReason}
          onSubmit={handleReassign}
        />
      </div>

      <p className="form-note">
        Reassignment history (auto): previous and new person, dates, reason, who reassigned. Times
        redone goes up by 1 each time.
      </p>
    </div>
  );
}

export default OverdueReassignPage;
