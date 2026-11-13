import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, InlineNotification, ProgressIndicator, ProgressStep } from '@carbon/react';
import type { DraftRecommendation, IssueType, Setting } from '../types/issue.types';
import CaseFields from '../components/log-issue/CaseFields';
import CauseFields from '../components/log-issue/CauseFields';
import CommentsField from '../components/log-issue/CommentsField';
import ContributingFactors from '../components/log-issue/ContributingFactors';
import DateFields from '../components/log-issue/DateFields';
import LocationFields from '../components/log-issue/LocationFields';
import PeriodDetailFields from '../components/log-issue/PeriodDetailFields';
import PersonFields from '../components/log-issue/PersonFields';
import RecommendationsStep from '../components/log-issue/RecommendationsStep';
import ReviewStep from '../components/log-issue/ReviewStep';
import { delayLevels } from '../constants/delayFactors';
import { addDays, daysBetween, getToday, yearsBetween } from '../utils/dates';
import { showToast } from '../../../components/shared/toast/toast';
import { useCurrentUser } from '../../../auth/CurrentUserContext';
import { placesAbove } from '../../../auth/locations';
import { createIssueWithRecommendations } from '../services/issueService';
import type { NewIssue } from '../services/issueService';
import BackButton from '../../../components/layout/BackButton';
import './LogIssuePage.scss';

// A perinatal death is a child aged 0 to 42 days.
const MAX_PERINATAL_AGE_DAYS = 42;

const steps = ['Location', 'Case', 'Delay and cause', 'Period and dates', 'Recommendations', 'Review'];
const lastStep = steps.length - 1;

// Readable names for stored values, used on the Review step.
const labels: Record<string, string> = {
  facility: 'Facility',
  community: 'Community',
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
  antenatal: 'Antenatal',
  intrapartum: 'Intrapartum',
  postpartum: 'Postpartum',
  female: 'Female',
  male: 'Male',
};

function LogIssuePage() {
  const navigate = useNavigate();

  const [furthestStep, setFurthestStep] = useState(0);

  // The step lives in the address (?step=2), so the Back button and the browser's
  // back arrow both return to the previous step. furthestStep stops anyone jumping
  // ahead to a step they haven't reached, e.g. by typing ?step=6.
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStep = Number(searchParams.get('step') ?? '1') - 1;
  const step = Number.isInteger(requestedStep)
    ? Math.min(Math.max(requestedStep, 0), furthestStep)
    : 0;

  // Moving to a step adds it to the browser history, like visiting a new page.
  function setStep(index: number) {
    setSearchParams({ step: String(index + 1) });
  }

  const [setting, setSetting] = useState<Setting | ''>('');
  const [loggedAt, setLoggedAt] = useState('');
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [periodOfDeath, setPeriodOfDeath] = useState('');
  const [gestationWeeks, setGestationWeeks] = useState('');
  const [daysPostpartum, setDaysPostpartum] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [dateOfNotification, setDateOfNotification] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [recommendations, setRecommendations] = useState<DraftRecommendation[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reference lists. They stay empty until the backend provides them.
  const causeOptions: string[] = [];
  // Lists that come from the current user's places (see auth/locations.ts).
  const { currentUser, users: allUsers, locations, scope } = useCurrentUser();

  // Logged at: the user's facilities, or community units for a community setting.
  const loggedAtOptions = locations
    .filter(
      (location) =>
        scope.has(location.name) &&
        location.type === (setting === 'community' ? 'community-unit' : 'facility')
    )
    .map((location) => location.name);

  // Sub-county and county are worked out from the place chosen in Logged at.
  const above = placesAbove(loggedAt, locations);
  const subCounty = above.find((location) => location.type === 'sub-county')?.name ?? '';
  const county = above.find((location) => location.type === 'county')?.name ?? '';

  // Anyone who can hold a recommendation (everyone except admins), apart from yourself.
  const users = allUsers.filter((user) => user.role !== 'admin' && user.id !== currentUser?.id);

  const today = getToday();
  const isDeath = issueType !== 'near-miss';
  const isPerinatal = issueType === 'perinatal';

  // Perinatal only: the child must be 0 to 42 days old.
  const earliestDateOfBirth = isPerinatal ? addDays(today, -MAX_PERINATAL_AGE_DAYS) : '';

  // Age: in days for a perinatal child, in years for the mother.
  let age = '';
  if (dateOfBirth !== '' && issueType !== '') {
    age = isPerinatal
      ? `${daysBetween(dateOfBirth, today)} days`
      : `${yearsBetween(dateOfBirth, today)} years`;
  }

  function handleSettingChange(newSetting: Setting | '') {
    setSetting(newSetting);
    setLoggedAt('');
    if (newSetting !== 'facility' && issueType === 'near-miss') {
      setIssueType('');
    }
  }

  function handleIssueTypeChange(newIssueType: IssueType | '') {
    setIssueType(newIssueType);
    setGender('');
    // Switching to perinatal: clear a birth date older than 42 days.
    if (
      newIssueType === 'perinatal' &&
      dateOfBirth !== '' &&
      dateOfBirth < addDays(today, -MAX_PERINATAL_AGE_DAYS)
    ) {
      setDateOfBirth('');
      setDateOfDeath('');
    }
    if (newIssueType === 'near-miss') {
      setCauseOfDeath('');
      handlePeriodChange('');
      setDateOfDeath('');
    }
  }

  function handleDateOfBirthChange(newDate: string) {
    setDateOfBirth(newDate);
    // A death can't be before the birth.
    if (dateOfDeath !== '' && dateOfDeath < newDate) {
      setDateOfDeath('');
    }
  }

  function handlePeriodChange(newPeriod: string) {
    setPeriodOfDeath(newPeriod);
    setGestationWeeks('');
    setDaysPostpartum('');
  }

  function handleDateOfDeathChange(newDate: string) {
    setDateOfDeath(newDate);
    if (dateOfNotification !== '' && dateOfNotification < newDate) {
      setDateOfNotification('');
    }
  }

  function toggleFactor(factor: string) {
    setSelectedFactors((current) =>
      current.includes(factor)
        ? current.filter((item) => item !== factor)
        : [...current, factor]
    );
  }

  // Checks the browser can't do: Carbon date pickers and the recommendation list.
  function isStepComplete(index: number) {
    if (index === 1) {
      return dateOfBirth !== '';
    }
    if (index === 2) {
      return selectedFactors.length > 0;
    }
    if (index === 3) {
      return dateOfNotification !== '' && (!isDeath || dateOfDeath !== '');
    }
    if (index === 4) {
      return recommendations.length > 0;
    }
    return true;
  }

  function goToStep(index: number) {
    if (index <= furthestStep) {
      setStep(index);
      setShowErrors(false);
    }
  }

  function resetForm() {
    setSearchParams({ step: '1' }, { replace: true });
    setFurthestStep(0);
    setSetting('');
    setLoggedAt('');
    setIssueType('');
    setDateOfBirth('');
    setGender('');
    setCauseOfDeath('');
    handlePeriodChange('');
    setDateOfDeath('');
    setDateOfNotification('');
    setSelectedFactors([]);
    setComments('');
    setRecommendations([]);
    setShowErrors(false);
  }

  // "Continue" submits the form, so the browser first checks the required fields of this step.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isStepComplete(step)) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);

    if (step < lastStep) {
      const nextStep = step + 1;
      setStep(nextStep);
      setFurthestStep(Math.max(furthestStep, nextStep));
      return;
    }

    const issue: NewIssue = {
      setting,
      loggedAt,
      issueType,
      dateOfBirth,
      gender: isPerinatal ? gender : 'female',
      causeOfDeath,
      periodOfDeath,
      gestationWeeks,
      daysPostpartum,
      dateOfDeath,
      dateOfNotification,
      dateOfAudit: isDeath ? today : '',
      contributingFactors: selectedFactors,
      comments,
    };
    setSaving(true);
    try {
      await createIssueWithRecommendations(issue, recommendations, today);
      showToast(`Issue logged with ${recommendations.length} recommendation(s)`);
      resetForm();
      navigate('/mpdsr');
    } catch {
      showToast("Couldn't save the issue. Is the server running (npm run api)?", 'error');
    } finally {
      setSaving(false);
    }
  }

  const reviewItems = [
    { label: 'Setting', value: labels[setting] ?? '—' },
    { label: 'Logged at', value: loggedAt || '—' },
    { label: 'Issue type', value: labels[issueType] ?? '—' },
    { label: 'Person recorded', value: isPerinatal ? 'Child' : 'Mother' },
    { label: 'Date of birth', value: dateOfBirth || '—' },
    { label: 'Age', value: age || '—' },
    { label: 'Gender', value: isPerinatal ? labels[gender] ?? '—' : 'Female' },
    { label: 'Cause of death', value: isDeath ? causeOfDeath || '—' : 'n/a' },
    { label: 'Contributing factors', value: selectedFactors.join('; ') || '—' },
    { label: 'Period of death', value: isDeath ? labels[periodOfDeath] ?? '—' : 'n/a' },
    { label: 'Date of death', value: isDeath ? dateOfDeath || '—' : 'n/a' },
    { label: 'Date of notification', value: dateOfNotification || '—' },
    { label: 'Comments', value: comments || '—' },
    { label: 'Recommendations', value: recommendations.length },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Log issue</h1>
          <p className="page-subtitle">One form logs the issue and its recommendations.</p>
        </div>
      </div>

      <ProgressIndicator
        className="log-issue__steps"
        currentIndex={step}
        onChange={goToStep}
        spaceEqually
      >
        {steps.map((label, index) => (
          <ProgressStep key={label} label={label} disabled={index > furthestStep} />
        ))}
      </ProgressIndicator>

      {/* Step 5 checks its own fields, so the browser's required check is switched off there. */}
      <form onSubmit={handleSubmit} noValidate={step === 4}>
        <section className="form-card log-issue__card" aria-labelledby="stepTitle">
          <h2 id="stepTitle" className="form-section-title">
            {step + 1}. {steps[step]}
          </h2>

          {step === 0 && (
            <LocationFields
              setting={setting}
              loggedAt={loggedAt}
              loggedAtOptions={loggedAtOptions}
              subCounty={subCounty}
              county={county}
              onSettingChange={handleSettingChange}
              onLoggedAtChange={setLoggedAt}
            />
          )}

          {step === 1 && (
            <>
              <CaseFields
                setting={setting}
                issueType={issueType}
                onIssueTypeChange={handleIssueTypeChange}
              />
              <PersonFields
                issueType={issueType}
                dateOfBirth={dateOfBirth}
                age={age}
                gender={gender}
                today={today}
                earliestDateOfBirth={earliestDateOfBirth}
                showErrors={showErrors}
                onDateOfBirthChange={handleDateOfBirthChange}
                onGenderChange={setGender}
              />
            </>
          )}

          {step === 2 && (
            <>
              <CauseFields
                isDeath={isDeath}
                causeOfDeath={causeOfDeath}
                causeOptions={causeOptions}
                onCauseOfDeathChange={setCauseOfDeath}
              />
              <ContributingFactors
                delayLevels={delayLevels}
                showErrors={showErrors}
                selectedFactors={selectedFactors}
                onToggleFactor={toggleFactor}
              />
              <CommentsField comments={comments} onCommentsChange={setComments} />
            </>
          )}

          {step === 3 && (
            <>
              {isDeath ? (
                <PeriodDetailFields
                  periodOfDeath={periodOfDeath}
                  gestationWeeks={gestationWeeks}
                  daysPostpartum={daysPostpartum}
                  onPeriodOfDeathChange={handlePeriodChange}
                  onGestationWeeksChange={setGestationWeeks}
                  onDaysPostpartumChange={setDaysPostpartum}
                />
              ) : (
                <div className="form-block">
                  <InlineNotification
                    kind="info"
                    lowContrast
                    hideCloseButton
                    title="Near miss"
                    subtitle="Period of death and date of death are skipped."
                  />
                </div>
              )}
              <DateFields
                isDeath={isDeath}
                dateOfBirth={dateOfBirth}
                dateOfDeath={dateOfDeath}
                dateOfNotification={dateOfNotification}
                today={today}
                showErrors={showErrors}
                onDateOfDeathChange={handleDateOfDeathChange}
                onDateOfNotificationChange={setDateOfNotification}
              />
            </>
          )}

          {step === 4 && (
            <RecommendationsStep
              recommendations={recommendations}
              gapOptions={selectedFactors}
              users={users}
              today={today}
              showErrors={showErrors}
              onAdd={(recommendation) => setRecommendations((current) => [...current, recommendation])}
              onRemove={(index) =>
                setRecommendations((current) => current.filter((_, i) => i !== index))
              }
            />
          )}

          {step === 5 && (
            <ReviewStep items={reviewItems} recommendationCount={recommendations.length} />
          )}
        </section>

        <div className="log-issue__actions">
          {/* Back: the previous step, or the previous page on step 1. */}
          <BackButton inline />
          <div className="form-actions">
            <Button kind="ghost" onClick={resetForm}>
              Clear form
            </Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : step === lastStep ? 'Submit issue' : 'Continue'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LogIssuePage;
