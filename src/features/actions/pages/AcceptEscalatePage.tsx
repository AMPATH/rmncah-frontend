import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DataTableSkeleton } from '@carbon/react';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import type { Level } from '../../issues/types/issue.types';
import { useRecommendation } from '../../recommendations/hooks/useRecommendation';
import { whyBlocked } from '../../recommendations/utils/recommendationRules';
import { acceptRecommendation, escalateRecommendation } from '../../recommendations/services/recommendationService';
import RecommendationSummary from '../../recommendations/components/RecommendationSummary';
import RecommendationNotFound from '../../recommendations/components/RecommendationNotFound';
import AcceptancePanel from '../components/accept-escalate/AcceptancePanel';
import EscalateForm from '../components/accept-escalate/EscalateForm';
import type { EscalationAction } from '../types/action.types';

// Page 5: the responsible person accepts the recommendation, or moves it to another level.
function AcceptEscalatePage() {
  const { id: code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, users } = useCurrentUser();
  const { recommendation, loading, failed } = useRecommendation(code);

  const [action, setAction] = useState<EscalationAction | ''>('');
  const [targetLevel, setTargetLevel] = useState<Level | ''>('');
  const [targetPersonId, setTargetPersonId] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // People at the chosen level who can hold a recommendation (not the admin, not yourself).
  const peopleAtLevel = users.filter(
    (user) =>
      user.level === targetLevel && user.role !== 'SYSTEM_ADMIN' && user.id !== currentUser?.id
  );

  function changeLevel(level: Level | '') {
    setTargetLevel(level);
    setTargetPersonId('');
  }

  // Runs one action, then returns to the recommendation so the new status is visible.
  async function run(save: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await save();
      showToast(message);
      navigate(`/recommendations/${code}`);
    } catch {
      showToast("Couldn't save. Is the server running?", 'error');
      setBusy(false);
    }
  }

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

  const blockedBecause = whyBlocked('accept', recommendation, currentUser);
  const holder = users.find((user) => user.id === recommendation.responsiblePersonId);

  function handleAccept() {
    run(() => acceptRecommendation(recommendation!, currentUser!.id), 'Recommendation accepted');
  }

  function handleMove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (action === '' || targetLevel === '' || targetPersonId === '') {
      return;
    }
    run(
      () => escalateRecommendation(recommendation!, currentUser!.id, action, targetLevel, targetPersonId, reason),
      action === 'escalate' ? 'Recommendation escalated' : 'Recommendation de-escalated'
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Accept or escalate</h1>
      </div>

      <RecommendationSummary recommendation={recommendation} />

      <div className="form-columns">
        <AcceptancePanel
          assignedTo={holder ? `${holder.fullName} (${holder.cadre})` : '—'}
          blockedBecause={blockedBecause}
          busy={busy}
          onAccept={handleAccept}
        />

        <EscalateForm
          action={action}
          targetLevel={targetLevel}
          targetPersonId={targetPersonId}
          reason={reason}
          users={peopleAtLevel}
          blockedBecause={blockedBecause}
          busy={busy}
          onActionChange={setAction}
          onTargetLevelChange={changeLevel}
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
