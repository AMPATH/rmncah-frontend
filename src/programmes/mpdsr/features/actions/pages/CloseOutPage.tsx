import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { DataTableSkeleton } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { placesWithin } from '../../../auth/locations';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import { useRecommendation } from '../../recommendations/hooks/useRecommendation';
import { whyBlocked } from '../../recommendations/utils/recommendationRules';
import { decideRecommendation, markRecommendationDone } from '../../recommendations/services/recommendationService';
import RecommendationSummary from '../../recommendations/components/RecommendationSummary';
import RecommendationNotFound from '../../recommendations/components/RecommendationNotFound';
import ApprovalTrail from '../components/close-out/ApprovalTrail';
import EvidenceList from '../../recommendations/components/EvidenceList';
import { evidenceProblem } from '../../recommendations/services/evidenceService';
import ChairDecisionForm from '../components/close-out/ChairDecisionForm';
import MarkDoneForm from '../components/close-out/MarkDoneForm';
import type { Decision } from '../types/action.types';

function CloseOutPage() {
  const { id: code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, users, locations } = useCurrentUser();
  const { recommendation, issue, events, evidence, loading, failed } = useRecommendation(code);

  const [remarks, setRemarks] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceError, setEvidenceError] = useState('');
  const [decision, setDecision] = useState<Decision | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [busy, setBusy] = useState(false);

  function handleEvidenceChange(file: File | null) {
    setEvidenceFile(file);
    setEvidenceError(file ? evidenceProblem(file) : '');
  }

  function handleDecisionChange(newDecision: Decision | '') {
    setDecision(newDecision);
    if (newDecision !== 'reject') {
      setRejectionReason('');
    }
  }

  async function run(save: () => Promise<unknown>, message: string, kind: 'success' | 'warning' = 'success') {
    setBusy(true);
    try {
      await save();
      showToast(message, kind);
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

  const chairIds = users
    .filter(
      (user) =>
        user.role === 'FACILITY_CHAIR' &&
        issue !== undefined &&
        placesWithin(user.assignedLocations, locations).has(issue.loggedAt)
    )
    .map((user) => user.id);

  function handleMarkDone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    run(
      () => markRecommendationDone(recommendation!, currentUser!.id, remarks, evidenceFile, chairIds),
      'Sent to the MPDSR chair for approval'
    );
  }

  function handleDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (decision === '') {
      return;
    }
    run(
      () => decideRecommendation(recommendation!, currentUser!.id, decision, rejectionReason),
      decision === 'approve' ? 'Approved and closed' : 'Rejected and reopened',
      decision === 'approve' ? 'success' : 'warning'
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1></h1>
      </div>

      <RecommendationSummary recommendation={recommendation} />

      <div className="form-columns">
        <MarkDoneForm
          remarks={remarks}
          blockedBecause={whyBlocked('markDone', recommendation, currentUser)}
          busy={busy}
          onRemarksChange={setRemarks}
          evidenceError={evidenceError}
          onEvidenceChange={handleEvidenceChange}
          onSubmit={handleMarkDone}
        />

        <ChairDecisionForm
          decision={decision}
          rejectionReason={rejectionReason}
          blockedBecause={whyBlocked('approve', recommendation, currentUser)}
          busy={busy}
          onDecisionChange={handleDecisionChange}
          onRejectionReasonChange={setRejectionReason}
          onSubmit={handleDecision}
        />
      </div>

      <ApprovalTrail recommendation={recommendation} events={events} />

      <section className="form-card">
        <h2 className="form-section-title">Evidence</h2>
        <EvidenceList files={evidence} />
      </section>
    </div>
  );
}

export default CloseOutPage;
