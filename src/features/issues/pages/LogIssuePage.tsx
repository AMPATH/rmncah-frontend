import { useState } from 'react';
import type { FormEvent } from 'react';
import type { IssueType, Setting } from '../types/issue.types';
import CauseFields from '../components/log-issue/CauseFields';
import CommentsField from '../components/log-issue/CommentsField';
import ContributingFactors from '../components/log-issue/ContributingFactors';
import DateFields from '../components/log-issue/DateFields';
import LocationFields from '../components/log-issue/LocationFields';
import PeriodDetailFields from '../components/log-issue/PeriodDetailFields';
import PersonFields from '../components/log-issue/PersonFields';
import { addDays, daysBetween, getToday, yearsBetween } from '../utils/dates';


const MAX_PERINATAL_AGE_DAYS = 42;

function LogIssuePage() {
  const [setting, setSetting] = useState<Setting | ''>('');
  const [loggedAt, setLoggedAt] = useState('');
  const [issueType, setIssueType] = useState<IssueType | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [levelOfDelay, setLevelOfDelay] = useState('');
  const [periodOfDeath, setPeriodOfDeath] = useState('');
  const [gestationWeeks, setGestationWeeks] = useState('');
  const [daysPostpartum, setDaysPostpartum] = useState('');
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [dateOfNotification, setDateOfNotification] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [showDateErrors, setShowDateErrors] = useState(false);

  const loggedAtOptions: string[] = [];
  const causeOptions: string[] = [];
  const delayFactors: Record<string, string[]> = {
    '1st': [],
    '2nd': [],
    '3rd': [],
  };

  const today = getToday();
  const isDeath = issueType !== 'near-miss';
  const isPerinatal = issueType === 'perinatal';

  // Perinatal only: the child must be 0 to 42 days old, so the date of birth
  // can be at most 42 days before today.
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
    if (newSetting === 'community' && issueType === 'near-miss') {
      setIssueType('');
    }
  }

  function handleIssueTypeChange(newIssueType: IssueType | '') {
    setIssueType(newIssueType);
    setGender('');

    if (newIssueType === 'perinatal' && dateOfBirth !== '' && dateOfBirth < addDays(today, -MAX_PERINATAL_AGE_DAYS)) {
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();


    const datesMissing =
      dateOfBirth === '' || dateOfNotification === '' || (isDeath && dateOfDeath === '');
    if (datesMissing) {
      setShowDateErrors(true);
      return;
    }

    const issue = {
      setting,
      loggedAt,
      issueType,
      dateOfBirth,
      gender: issueType === 'perinatal' ? gender : 'female',
      causeOfDeath,
      levelOfDelay,
      periodOfDeath,
      gestationWeeks,
      daysPostpartum,
      dateOfDeath,
      dateOfNotification,
      dateOfAudit: isDeath ? today : '',
      contributingFactors: selectedFactors,
      comments,
    };

    console.log('Issue to save:', issue);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Log issue</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <LocationFields
          setting={setting}
          loggedAt={loggedAt}
          issueType={issueType}
          loggedAtOptions={loggedAtOptions}
          onSettingChange={handleSettingChange}
          onLoggedAtChange={setLoggedAt}
          onIssueTypeChange={handleIssueTypeChange}
        />

        <PersonFields
          issueType={issueType}
          dateOfBirth={dateOfBirth}
          age={age}
          gender={gender}
          today={today}
          earliestDateOfBirth={earliestDateOfBirth}
          showErrors={showDateErrors}
          onDateOfBirthChange={handleDateOfBirthChange}
          onGenderChange={setGender}
        />

        <CauseFields
          isDeath={isDeath}
          causeOfDeath={causeOfDeath}
          levelOfDelay={levelOfDelay}
          periodOfDeath={periodOfDeath}
          causeOptions={causeOptions}
          onCauseOfDeathChange={setCauseOfDeath}
          onLevelOfDelayChange={setLevelOfDelay}
          onPeriodOfDeathChange={handlePeriodChange}
        />

        {isDeath && periodOfDeath !== '' && (
          <PeriodDetailFields
            periodOfDeath={periodOfDeath}
            gestationWeeks={gestationWeeks}
            daysPostpartum={daysPostpartum}
            onGestationWeeksChange={setGestationWeeks}
            onDaysPostpartumChange={setDaysPostpartum}
          />
        )}

        <DateFields
          isDeath={isDeath}
          dateOfBirth={dateOfBirth}
          dateOfDeath={dateOfDeath}
          dateOfNotification={dateOfNotification}
          today={today}
          showErrors={showDateErrors}
          onDateOfDeathChange={handleDateOfDeathChange}
          onDateOfNotificationChange={setDateOfNotification}
        />

        <ContributingFactors
          delayFactors={delayFactors}
          selectedFactors={selectedFactors}
          onToggleFactor={toggleFactor}
        />

        <CommentsField comments={comments} onCommentsChange={setComments} />

        <p className="form-note">
          Auto: sub-county, county, linked facility, Issue ID, logged by with cadre. Near miss
          hides death-only fields.
        </p>

        <button type="submit">Save issue and add recommendation</button>
      </form>
    </div>
  );
}

export default LogIssuePage;
