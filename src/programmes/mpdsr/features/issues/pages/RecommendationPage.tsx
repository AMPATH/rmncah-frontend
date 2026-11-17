import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification } from '@carbon/react';
import { showToast } from '../../../components/shared/toast/toast';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { useCurrentUser } from '../../../context/currentUserContext';
import { issuesInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import AssignmentFields from '../components/recommendation/AssignmentFields';
import ClassificationFields from '../components/recommendation/ClassificationFields';
import CompletionFields from '../components/recommendation/CompletionFields';
import IdFields from '../components/recommendation/IdFields';
import RecommendationText from '../components/recommendation/RecommendationText';
import RoutingHint from '../components/recommendation/RoutingHint';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { addRecommendationToIssue } from '../../recommendations/services/recommendationService';
import type { Classification, Level } from '../types/issue.types';
import { addMonths, getToday } from '../../../utils/dates';

// The longest time each classification allows (from the workflow document).
const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

// Adds a recommendation to an issue logged earlier (/issues/ISS-2026-0001/recommendation),
// e.g. after the review meeting. Opened from the Issues list.
function RecommendationPage() {
  const { id: issueCode = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, users: allUsers, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);

  const [gap, setGap] = useState('');
  const [responsiblePersonId, setResponsiblePersonId] = useState('');
  const [text, setText] = useState('');
  const [classification, setClassification] = useState<Classification | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [dateOfCompletion, setDateOfCompletion] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  const issue = issuesInScope(issuesData.data, scope).find((item) => item.code === issueCode && item.cancelled !== true);
  const existingCodes = recommendationsData.data
    .filter((recommendation) => recommendation.issueId === issue?.id)
    .map((recommendation) => recommendation.code);

  // The gaps are the contributing factors chosen when the issue was logged.
  const gapOptions = issue?.contributingFactors ?? [];
  // Anyone who can hold a recommendation, except the admin and yourself.
  const users = allUsers.filter((user) => user.role !== 'SYSTEM_ADMIN' && user.id !== currentUser?.id && user.active !== false);

  const today = getToday();
  const missingDetails =
    text.trim() === '' || responsiblePersonId === '' || classification === '' || level === '' || dateOfCompletion === '';

  // The latest allowed completion date: 1, 3 or 6 months from today.
  const latestCompletion = classification ? addMonths(today, monthsAllowed[classification]) : '';

  // A new classification prefills the latest allowed date. The user may then pick earlier.
  function handleClassificationChange(newClassification: Classification | '') {
    setClassification(newClassification);
    setDateOfCompletion(newClassification ? addMonths(today, monthsAllowed[newClassification]) : '');
  }

  function resetForm() {
    setGap('');
    setResponsiblePersonId('');
    setText('');
    setClassification('');
    setLevel('');
    setDateOfCompletion('');
    setShowErrors(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Which button was pressed: "Save recommendation" or "Add another".
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const addAnother = submitter?.name === 'add-another';

    if (issue === undefined || missingDetails) {
      setShowErrors(true);
      return;
    }

    setBusy(true);
    try {
      const saved = await addRecommendationToIssue(
        issue,
        { gap, responsiblePersonId, text: text.trim(), classification, level, dateOfCompletion },
        existingCodes
      );
      if (addAnother) {
        showToast(`${saved.code} saved. Add the next one.`);
        resetForm();
        recommendationsData.reload();
      } else {
        showToast(`${saved.code} saved`);
        navigate(`/recommendations/${saved.code}`);
      }
    } catch {
      showToast("Couldn't save the recommendation. Is the server running?", 'error');
    }
    setBusy(false);
  }

  if (issuesData.loading || recommendationsData.loading) {
    return <DataTableSkeleton columnCount={2} rowCount={6} showHeader={false} showToolbar={false} />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Add recommendation</h1>
      </div>

      {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}

      {issue === undefined ? (
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="Issue not found"
          subtitle="It may not exist, or it was logged at a place outside your responsibility."
        />
      ) : (
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <IdFields issueId={issue.code} />

          <AssignmentFields
            gap={gap}
            responsiblePersonId={responsiblePersonId}
            gapOptions={gapOptions}
            users={users}
            onGapChange={setGap}
            onResponsiblePersonChange={setResponsiblePersonId}
          />

          <RecommendationText text={text} onTextChange={setText} />

          <ClassificationFields
            classification={classification}
            level={level}
            dateLogged={today}
            onClassificationChange={handleClassificationChange}
            onLevelChange={setLevel}
          />

          <RoutingHint level={level} />

          <CompletionFields
            level={level}
            dateOfCompletion={dateOfCompletion}
            earliestDate={today}
            latestDate={latestCompletion}
            showErrors={showErrors}
            onDateOfCompletionChange={setDateOfCompletion}
          />

          {showErrors && missingDetails && (
            <InlineNotification
              kind="error"
              lowContrast
              hideCloseButton
              title="Some details are missing"
              subtitle="Fill in the responsible person, the recommendation, the classification, the level and the completion date."
            />
          )}

          <p className="form-note">
            Completion date is prefilled at 1, 3 or 6 months from date logged. It may be set earlier, never later.
            {existingCodes.length > 0 && ` This issue already has ${existingCodes.length} recommendation(s).`}
          </p>

          <div className="form-actions">
            <Button type="submit" name="save" disabled={busy}>
              {busy ? 'Saving…' : 'Save recommendation'}
            </Button>
            <Button type="submit" name="add-another" kind="secondary" disabled={busy}>
              Save and add another
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RecommendationPage;
