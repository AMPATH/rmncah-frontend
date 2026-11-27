import './IssueDetailPage.scss';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification, TextArea } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { issuesInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import CauseFields from '../components/log-issue/CauseFields';
import CommentsField from '../components/log-issue/CommentsField';
import ContributingFactors from '../components/log-issue/ContributingFactors';
import DateFields from '../components/log-issue/DateFields';
import PeriodDetailFields from '../components/log-issue/PeriodDetailFields';
import PersonFields from '../components/log-issue/PersonFields';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { editIssue, issueDifferences } from '../services/issueEditService';
import type { IssueChanges } from '../services/issueEditService';
import { addDays, daysBetween, getToday, yearsBetween } from '../../../utils/dates';
import { whyIssueBlocked } from '../utils/issueRules';
import { delaysMissing } from '../utils/delayRecommendations';
import { causeOptionsFor, getCausesOfDeath } from '../services/causeService';
import { emptyDelayLevels, getDelayLevels } from '../services/contributingFactorService';
import type { CauseOfDeath } from '../services/causeService';

const MAX_PERINATAL_AGE_DAYS = 42;

const emptyChanges: IssueChanges = {
  dateOfBirth: '',
  gender: '',
  causeOfDeath: '',
  periodOfDeath: '',
  gestationWeeks: '',
  daysPostpartum: '',
  dateOfDeath: '',
  dateOfNotification: '',
  dateOfAudit: '',
  contributingFactors: [],
  comments: '',
};

function IssueEditPage() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const causesData = useApiData<CauseOfDeath[]>(getCausesOfDeath, []);
  const delayData = useApiData(getDelayLevels, emptyDelayLevels);

  const issue = issuesInScope(issuesData.data, scope).find((item) => item.code === code);
  const recommendations = recommendationsData.data.filter((recommendation) => recommendation.issueId === issue?.id);

  const [values, setValues] = useState<IssueChanges>(emptyChanges);
  const [reason, setReason] = useState('');
  const [keptFactor, setKeptFactor] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (issue) {
      setValues({
        dateOfBirth: issue.dateOfBirth ?? '',
        gender: issue.gender ?? '',
        causeOfDeath: issue.causeOfDeath ?? '',
        periodOfDeath: issue.periodOfDeath ?? '',
        gestationWeeks: issue.gestationWeeks ?? '',
        daysPostpartum: issue.daysPostpartum ?? '',
        dateOfDeath: issue.dateOfDeath ?? '',
        dateOfNotification: issue.dateOfNotification ?? '',
        dateOfAudit: issue.dateOfAudit ?? '',
        contributingFactors: issue.contributingFactors ?? [],
        comments: issue.comments ?? '',
      });
    }
  }, [issue]);

  if (issuesData.loading || recommendationsData.loading) {
    return <DataTableSkeleton columnCount={2} rowCount={8} showHeader={false} showToolbar={false} />;
  }

  if (!issue || !currentUser) {
    return (
      <div className="page">
        {(issuesData.failed || recommendationsData.failed) && <ApiErrorNotice />}
        <InlineNotification
          kind="warning"
          lowContrast
          hideCloseButton
          title="Issue not found"
          subtitle="It may not exist, or it was logged at a place outside your responsibility."
        />
      </div>
    );
  }

  const today = getToday();
  const editBlocked = whyIssueBlocked('edit', issue, currentUser, recommendations, today);
  const isDeath = issue.issueType !== 'near-miss';
  const isPerinatal = issue.issueType === 'perinatal';
  const differences = issueDifferences(issue, values);

  const dateProblem =
    values.dateOfDeath !== '' && values.dateOfBirth !== '' && values.dateOfDeath < values.dateOfBirth
      ? 'The date of death is before the date of birth.'
      : values.dateOfNotification !== '' && values.dateOfDeath !== '' && values.dateOfNotification < values.dateOfDeath
        ? 'The date of notification is before the date of death.'
        : values.dateOfAudit !== '' && values.dateOfNotification !== '' && values.dateOfAudit < values.dateOfNotification
          ? 'The date of audit is before the date of notification.'
          : '';

  let age = '';
  if (values.dateOfBirth !== '') {
    age = isPerinatal
      ? `${daysBetween(values.dateOfBirth, issue.dateLogged)} days`
      : `${yearsBetween(values.dateOfBirth, issue.dateLogged)} years`;
  }

  function set<K extends keyof IssueChanges>(field: K, value: IssueChanges[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toggleFactor(factor: string) {
    const ticked = values.contributingFactors.includes(factor);
    // Each level of delay has its own recommendation, so it must keep at least one factor.
    if (ticked && delaysMissing(values.contributingFactors.filter((item) => item !== factor)).length > 0) {
      setKeptFactor(factor);
      return;
    }
    setKeptFactor('');
    set(
      'contributingFactors',
      ticked ? values.contributingFactors.filter((item) => item !== factor) : [...values.contributingFactors, factor]
    );
  }

  async function run(save: () => Promise<unknown>, message: string) {
    setBusy(true);
    try {
      await save();
      showToast(message);
      navigate(`/issues/${issue!.code}`);
    } catch {
      showToast("Couldn't save. Is the server running?", 'error');
      setBusy(false);
    }
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim() === '' || dateProblem !== '') {
      setShowErrors(true);
      return;
    }
    run(() => editIssue(issue!, currentUser!.id, values, reason.trim()), 'Issue updated');
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Edit {issue.code}</h1>
          <p className="page-subtitle">
            Correct data-entry mistakes. Issue type, setting and place can't change.
          </p>
        </div>
      </div>

      {editBlocked && (
        <InlineNotification kind="info" lowContrast hideCloseButton title="Editing isn't available" subtitle={editBlocked} />
      )}

      <form className="form-card" onSubmit={handleSave} noValidate>
        <fieldset disabled={editBlocked !== '' || busy} className="issue-edit__fields">
          <h2 className="form-section-title">Case</h2>
          <PersonFields
            issueType={issue.issueType}
            dateOfBirth={values.dateOfBirth}
            age={age}
            gender={values.gender}
            today={issue.dateLogged}
            earliestDateOfBirth={isPerinatal ? addDays(issue.dateLogged, -MAX_PERINATAL_AGE_DAYS) : ''}
            showErrors={showErrors}
            onDateOfBirthChange={(value) => set('dateOfBirth', value)}
            onGenderChange={(value) => set('gender', value)}
          />

          {isDeath && (
            <>
              <CauseFields
                isDeath={isDeath}
                causeOfDeath={values.causeOfDeath}
                causeOptions={causeOptionsFor(causesData.data, issue.issueType)}
                onCauseOfDeathChange={(value) => set('causeOfDeath', value)}
              />
              <PeriodDetailFields
                periodOfDeath={values.periodOfDeath}
                gestationWeeks={values.gestationWeeks}
                daysPostpartum={values.daysPostpartum}
                onPeriodOfDeathChange={(value) =>
                  setValues((current) => ({ ...current, periodOfDeath: value, gestationWeeks: '', daysPostpartum: '' }))
                }
                onGestationWeeksChange={(value) => set('gestationWeeks', value)}
                onDaysPostpartumChange={(value) => set('daysPostpartum', value)}
              />
            </>
          )}

          <h2 className="form-section-title">Dates</h2>
          <DateFields
            isDeath={isDeath}
            dateOfBirth={values.dateOfBirth}
            dateOfDeath={values.dateOfDeath}
            dateOfNotification={values.dateOfNotification}
            today={today}
            showErrors={showErrors}
            onDateOfDeathChange={(value) => set('dateOfDeath', value)}
            onDateOfNotificationChange={(value) => set('dateOfNotification', value)}
          />

          <h2 className="form-section-title">Contributing factors and comments</h2>
          {keptFactor && (
            <InlineNotification
              kind="warning"
              lowContrast
              title="This factor stays"
              subtitle={`"${keptFactor}" is the last factor of its level of delay. Each level of delay needs at least one factor because it has its own recommendation.`}
              onClose={() => setKeptFactor('')}
            />
          )}
          <ContributingFactors
            delayLevels={delayData.data}
            loading={delayData.loading}
            loadFailed={delayData.failed}
            selectedFactors={values.contributingFactors}
            showErrors={false}
            onToggleFactor={toggleFactor}
          />
          <CommentsField comments={values.comments} onCommentsChange={(value) => set('comments', value)} />

          <TextArea
            id="editReason"
            labelText="Reason for the change"
            placeholder="e.g. Date of death was entered wrongly"
            rows={2}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            invalid={showErrors && reason.trim() === ''}
            invalidText="Give the reason for the change"
          />

          {showErrors && dateProblem && (
            <InlineNotification kind="error" lowContrast hideCloseButton title="Check the dates" subtitle={dateProblem} />
          )}

          <p className="form-note">
            {differences.length === 0
              ? 'Nothing changed yet.'
              : `Will change: ${differences.map((difference) => difference.field).join(', ')}.`}
          </p>

          <div className="form-actions">
            <Button kind="secondary" onClick={() => navigate(`/issues/${issue.code}`)}>
              Back to the issue
            </Button>
            <Button type="submit" disabled={editBlocked !== '' || busy || differences.length === 0}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default IssueEditPage;
