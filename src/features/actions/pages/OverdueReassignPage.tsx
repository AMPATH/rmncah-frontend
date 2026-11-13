import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DataTableSkeleton } from '@carbon/react';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import { getToday } from '../../issues/utils/dates';
import { useRecommendation } from '../../recommendations/hooks/useRecommendation';
import { whyBlocked } from '../../recommendations/utils/recommendationRules';
import { reassignRecommendation } from '../../recommendations/services/recommendationService';
import RecommendationSummary from '../../recommendations/components/RecommendationSummary';
import RecommendationNotFound from '../../recommendations/components/RecommendationNotFound';
import OverdueRecord from '../components/overdue/OverdueRecord';
import ReassignForm from '../components/overdue/ReassignForm';

// Page 6: the PCN coordinator hands an overdue recommendation to a new person with a new due date.
function OverdueReassignPage() {
  const { id: code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, users, scope } = useCurrentUser();
  const { recommendation, events, loading, failed } = useRecommendation(code);

  const [newResponsiblePersonId, setNewResponsiblePersonId] = useState('');
  const [newCompletionDate, setNewCompletionDate] = useState('');
  const [reason, setReason] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  // People working in the coordinator's places (the coordinator included, who may take it on).
  const candidates = users.filter(
    (user) =>
      user.role !== 'SYSTEM_ADMIN' && user.assignedLocations.some((place) => scope.has(place))
  );

  if (loading) {
    return <DataTableSkeleton columnCount={2} rowCount={5} showHeader={false} showToolbar={false} />;
  }

  if (!recommendation || !currentUser) {
    return (
      <div className="page">
        {failed && <ApiErrorNotice />}
        <RecommendationNotFound />
      </div>
    );
  }

  const blockedBecause = whyBlocked('reassign', recommendation, currentUser);
  const holder = users.find((user) => user.id === recommendation.responsiblePersonId);
  const markedOverdue = [...events].reverse().find((event) => event.action === 'marked-overdue');

  async function handleReassign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newCompletionDate === '' || newResponsiblePersonId === '') {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    try {
      await reassignRecommendation(
        recommendation!,
        currentUser!.id,
        newResponsiblePersonId,
        newCompletionDate,
        reason
      );
      showToast('Recommendation reassigned');
      navigate(`/recommendations/${code}`);
    } catch {
      showToast("Couldn't save. Is the server running?", 'error');
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Overdue and reassign</h1>
      </div>

      <RecommendationSummary recommendation={recommendation} />

      <div className="form-columns">
        <OverdueRecord
          dueDate={recommendation.dueDate}
          dateMarkedOverdue={markedOverdue?.at.slice(0, 10) ?? '—'}
          responsiblePerson={holder ? `${holder.fullName} (${holder.cadre})` : '—'}
          timesRedone={recommendation.timesRedone}
        />

        <ReassignForm
          newResponsiblePersonId={newResponsiblePersonId}
          newCompletionDate={newCompletionDate}
          reason={reason}
          users={candidates}
          today={getToday()}
          showErrors={showErrors}
          blockedBecause={blockedBecause}
          busy={busy}
          onPersonChange={setNewResponsiblePersonId}
          onCompletionDateChange={setNewCompletionDate}
          onReasonChange={setReason}
          onSubmit={handleReassign}
        />
      </div>

      <p className="form-note">
        The new person must accept it. Every reassignment is kept in the recommendation's history,
        and Times redone goes up by 1.
      </p>
    </div>
  );
}

export default OverdueReassignPage;
