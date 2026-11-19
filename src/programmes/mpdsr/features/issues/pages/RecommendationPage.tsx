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
import GapField from '../components/recommendation/GapField';
import { isReviewed } from '../utils/caseReview';
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

const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

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

  const gapOptions = issue?.contributingFactors ?? [];
  const users = allUsers.filter((user) => user.role !== 'SYSTEM_ADMIN' && user.id !== currentUser?.id && user.active !== false);

  const today = getToday();
  const held = issue !== undefined && !isReviewed(issue);
  const missingDetails =
    text.trim() === '' ||
    (!held && (responsiblePersonId === '' || level === '')) ||
    classification === '' ||
    dateOfCompletion === '';

  const latestCompletion = classification ? addMonths(today, monthsAllowed[classification]) : '';

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
        {
          gap,
          responsiblePersonId: held ? '' : responsiblePersonId,
          text: text.trim(),
          classification,
          level: held ? '' : level,
          dateOfCompletion,
        },
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

          <GapField gap={gap} gapOptions={gapOptions} onGapChange={setGap} />

          <RecommendationText text={text} onTextChange={setText} />

          <ClassificationFields
            classification={classification}
            level={level}
            dateLogged={today}
            onClassificationChange={handleClassificationChange}
            onLevelChange={(value) => {
              setLevel(value);
              setResponsiblePersonId('');
            }}
            showLevel={!held}
          />

          {held ? (
            <p className="form-note">
              The facility MPDSR chair chooses the level of implementation and the responsible person during the case
              review.
            </p>
          ) : (
            <>
              <AssignmentFields
                responsiblePersonId={responsiblePersonId}
                level={level}
                users={users}
                onResponsiblePersonChange={setResponsiblePersonId}
              />

              <RoutingHint level={level} />
            </>
          )}

          <CompletionFields
            level={level}
            held={held}
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
              subtitle={
                held
                  ? 'Fill in the recommendation, the classification and the completion date.'
                  : 'Fill in the responsible person, the recommendation, the classification, the level and the completion date.'
              }
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
