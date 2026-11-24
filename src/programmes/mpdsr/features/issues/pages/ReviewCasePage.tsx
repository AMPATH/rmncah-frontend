import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  Button,
  DataTableSkeleton,
  DatePicker,
  DatePickerInput,
  InlineNotification,
  ProgressIndicator,
  ProgressStep,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Tag,
  TextArea,
  TextInput,
} from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { can } from '../../../auth/permissions';
import { issuesInScope } from '../../../auth/scope';
import { useApiData } from '../../../hooks/useApiData';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import InfoList from '../../../components/shared/InfoList';
import StatusTag from '../../../components/shared/StatusTag';
import { showToast } from '../../../components/shared/toast/toast';
import { formatDateTime, getToday, toIsoDate } from '../../../utils/dates';
import CauseFields from '../components/log-issue/CauseFields';
import ContributingFactors from '../components/log-issue/ContributingFactors';
import { delayLevels } from '../constants/delayFactors';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { causeOptionsFor, getCausesOfDeath } from '../services/causeService';
import type { CauseOfDeath } from '../services/causeService';
import { completeCaseReview, reviewDifferences } from '../services/reviewService';
import type { ReviewedRecommendation } from '../services/reviewService';
import { isReviewed } from '../utils/caseReview';
import { latestCompletionDate } from '../utils/classification';
import { delayGaps, delayOfGap, delaysMissing } from '../utils/delayRecommendations';
import { countyOfPlace, responsiblePeople } from '../utils/responsiblePeople';
import type { Classification, DraftRecommendation, Level } from '../types/issue.types';
import './LogIssuePage.scss';
import './ReviewCasePage.scss';
import { levelLabels, levelsFor } from '../../recommendations/utils/levels';

const steps = ['Case summary', 'Final cause', 'Contributing factors', 'Recommendations', 'Check and complete'];
const lastStep = steps.length - 1;
const editableStatuses = ['Pending review', 'Open', 'Pending acceptance', 'In progress'];

const issueTypeLabels: Record<string, string> = {
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
};

const classificationLabels: Record<Classification, string> = {
  immediate: 'Immediate (1 month)',
  intermediate: 'Intermediate (3 months)',
  'long-term': 'Long term (6 months)',
};

function orDash(value: string | undefined) {
  return value && value.trim() !== '' ? value : '—';
}

function ReviewCasePage() {
  const { code = '' } = useParams();
  const { currentUser, users, locations, scope } = useCurrentUser();
  const issuesData = useApiData<StoredIssue[]>(getIssues, []);
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const causesData = useApiData<CauseOfDeath[]>(getCausesOfDeath, []);

  const issue = issuesInScope(issuesData.data, scope).find((item) => item.code === code);
  const recommendations = recommendationsData.data.filter(
    (recommendation) => recommendation.issueId === issue?.id && recommendation.status !== 'Cancelled'
  );

  if (issuesData.loading || recommendationsData.loading) {
    return <DataTableSkeleton columnCount={2} rowCount={8} showHeader={false} showToolbar={false} />;
  }

  if (!issue) {
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

  if (!can(currentUser, 'issue.review')) {
    return (
      <div className="page">
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Only the facility MPDSR chair reviews a case"
          subtitle="You can follow the issue and its recommendations from the issue page."
        />
        <Link className="cds--link" to={`/issues/${issue.code}`}>
          Back to {issue.code}
        </Link>
      </div>
    );
  }

  if (isReviewed(issue)) {
    return <CompletedReview issue={issue} />;
  }

  return (
    <ReviewForm
      key={issue.id}
      issue={issue}
      recommendations={recommendations}
      causeOptions={causeOptionsFor(causesData.data, issue.issueType)}
      userId={currentUser!.id}
      users={users}
      locations={locations}
    />
  );
}

function CompletedReview({ issue }: { issue: StoredIssue }) {
  const { users } = useCurrentUser();
  const review = issue.review!;
  const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? id;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Case review · {issue.code}</h1>
          <p className="page-subtitle">
            Completed {formatDateTime(review.completedAt)} by {nameOf(review.completedById)}
          </p>
        </div>
      </div>
      <InlineNotification
        kind="success"
        lowContrast
        hideCloseButton
        title="Review complete"
        subtitle="The record is locked. Every change made in the review is in the issue's history."
      />
      <section className="form-card">
        <InfoList
          items={[
            { label: 'Review date', value: orDash(review.reviewDate) },
            { label: 'Reviewed by', value: nameOf(review.completedById) },
            { label: 'Final cause of death', value: orDash(review.finalCause) },
          ]}
        />
      </section>
      <Link className="cds--link" to={`/issues/${issue.code}`}>
        Open {issue.code}
      </Link>
    </div>
  );
}

// One recommendation the chair completes. A logged one has a code; a new one (for a delay
// that had no recommendation, for example on an older issue) has an empty code.
interface ReviewItem extends ReviewedRecommendation {
  key: string;
  delay: string;
  // The gap and text when the review opened, so a cleared recommendation can come back.
  startGap: string;
  startText: string;
}

interface ReviewFormProps {
  issue: StoredIssue;
  recommendations: StoredRecommendation[];
  causeOptions: string[];
  userId: string;
  users: ReturnType<typeof useCurrentUser>['users'];
  locations: ReturnType<typeof useCurrentUser>['locations'];
}

function ReviewForm({ issue, recommendations, causeOptions, userId, users, locations }: ReviewFormProps) {
  const navigate = useNavigate();
  const today = getToday();
  const isDeath = issue.issueType !== 'near-miss';
  // Responsible people come from the same county as the place where the issue was logged.
  const issueCounty = countyOfPlace(issue.loggedAt, locations);
  const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? '—';

  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const loggedCause = issue.causeOfDeath ?? '';
  const [reviewDate, setReviewDate] = useState(today);
  const [changeCause, setChangeCause] = useState<'' | 'no' | 'yes'>('');
  const [finalCause, setFinalCause] = useState(loggedCause);
  const [factors, setFactors] = useState<string[]>(issue.contributingFactors ?? []);

  const locked = recommendations.filter((recommendation) => !editableStatuses.includes(recommendation.status));
  const [items, setItems] = useState<ReviewItem[]>(() => {
    const startGaps = delayGaps(issue.contributingFactors ?? []);
    const logged: ReviewItem[] = recommendations
      .filter((recommendation) => editableStatuses.includes(recommendation.status))
      .map((recommendation) => {
        const delay = delayOfGap(recommendation.gap);
        // The gap follows the issue's factors, in case they were edited after logging.
        const gap = startGaps.find((entry) => entry.delay === delay)?.gap || recommendation.gap;
        return {
          key: recommendation.code,
          code: recommendation.code,
          delay,
          startGap: gap,
          startText: recommendation.text,
          text: recommendation.text,
          gap,
          classification: recommendation.classification,
          dueDate: recommendation.dueDate,
          responsiblePersonId: recommendation.responsiblePersonId,
          level: recommendation.level,
        };
      });
    const covered = [...logged.map((item) => item.delay), ...locked.map((recommendation) => delayOfGap(recommendation.gap))];
    const missing: ReviewItem[] = startGaps
      .filter((gap) => !covered.includes(gap.delay))
      .map((gap) => ({
        key: `new-${gap.delay}`,
        code: '',
        delay: gap.delay,
        startGap: gap.gap,
        startText: '',
        text: '',
        gap: gap.gap,
        classification: '',
        dueDate: '',
        responsiblePersonId: '',
        level: '',
      }));
    return [...logged, ...missing];
  });

  const edited: ReviewedRecommendation[] = items
    .filter((item) => item.code !== '')
    .map(({ code, text, gap, classification, dueDate, responsiblePersonId, level }) => ({
      code,
      text,
      gap,
      classification,
      dueDate,
      responsiblePersonId,
      level,
    }));
  const added: DraftRecommendation[] = items
    .filter((item) => item.code === '')
    .map(({ text, gap, classification, dueDate, responsiblePersonId, level }) => ({
      text,
      gap,
      classification,
      dateOfCompletion: dueDate,
      responsiblePersonId,
      level,
    }));
  const review = { reviewDate, finalCause };
  const differences = reviewDifferences({
    issue,
    review,
    contributingFactors: factors,
    existing: recommendations,
    edited,
    added,
    users,
  });

  const originalOf = (item: ReviewItem) => recommendations.find((recommendation) => recommendation.code === item.code);

  function updateItem(key: string, changes: Partial<ReviewItem>) {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)));
  }

  function changeClassification(item: ReviewItem, classification: Classification | '') {
    // The date of completion follows the classification.
    updateItem(item.key, { classification, dueDate: latestCompletionDate(classification, today) });
  }

  // When the factors of a delay change, the recommendation written for the old factors no longer
  // fits, so it is cleared. Ticking the factors back brings the logged text back.
  function toggleFactor(factor: string) {
    const next = factors.includes(factor) ? factors.filter((item) => item !== factor) : [...factors, factor];
    const gaps = delayGaps(next);
    setFactors(next);
    setItems((current) =>
      current.map((item) => {
        const gap = gaps.find((entry) => entry.delay === item.delay)?.gap;
        if (gap === undefined || gap === item.gap) return item;
        return { ...item, gap, text: gap === item.startGap ? item.startText : '' };
      })
    );
  }

  function itemProblem(item: ReviewItem) {
    if (item.text.trim() === '') return 'Write the recommendation';
    if (item.classification === '') return 'Choose the classification';
    if (item.dueDate === '') return 'Choose the date of completion';
    if (item.level === '') return 'Choose the level of implementation';
    if (item.responsiblePersonId === '') return 'Choose the responsible person';
    return '';
  }

  function isStepComplete(index: number) {
    if (index === 0) {
      return reviewDate !== '' && reviewDate <= today;
    }
    if (index === 1) {
      return (
        !isDeath ||
        (loggedCause !== '' && changeCause === 'no') ||
        ((loggedCause === '' || changeCause === 'yes') && (causeOptions.length === 0 || finalCause !== ''))
      );
    }
    if (index === 2) {
      return delaysMissing(factors).length === 0;
    }
    if (index === 3) {
      return items.length + locked.length > 0 && items.every((item) => itemProblem(item) === '');
    }
    return true;
  }

  function goToStep(index: number) {
    if (index <= furthestStep) {
      setStep(index);
      setShowErrors(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isStepComplete(step)) {
      setShowErrors(true);
      return;
    }
    if (step < lastStep) {
      const next = step + 1;
      setStep(next);
      setFurthestStep(Math.max(furthestStep, next));
      setShowErrors(false);
      window.scrollTo({ top: 0 });
      return;
    }

    setSaving(true);
    try {
      await completeCaseReview({
        issue,
        byUserId: userId,
        review,
        contributingFactors: factors,
        existing: recommendations,
        edited,
        added,
        users,
      });
      showToast(`Review of ${issue.code} completed`);
      navigate(`/issues/${issue.code}`);
    } catch {
      showToast("Couldn't save. Is the server running?", 'error');
      setSaving(false);
    }
  }

  const titleOf = (delay: string) => {
    const level = delayLevels.find((entry) => entry.id === delay);
    return level ? `${level.id} delay · ${level.title}` : 'Other recommendation';
  };
  const rankOf = (delay: string) => {
    const position = delayLevels.findIndex((level) => level.id === delay);
    return position === -1 ? delayLevels.length : position;
  };
  const sorted = [...items].sort((a, b) => rankOf(a.delay) - rankOf(b.delay));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Review case · {issue.code}</h1>
          <p className="page-subtitle">
            {issueTypeLabels[issue.issueType] ?? issue.issueType} · {issue.loggedAt} · logged {issue.dateLogged}
            {issue.loggedById ? ` by ${nameOf(issue.loggedById)}` : ''}
          </p>
        </div>
      </div>

      <ProgressIndicator className="log-issue__steps" currentIndex={step} onChange={goToStep} spaceEqually>
        {steps.map((label, index) => (
          <ProgressStep key={label} label={label} disabled={index > furthestStep} />
        ))}
      </ProgressIndicator>

      <form onSubmit={handleSubmit} noValidate>
        <section className="form-card log-issue__card">
          <h2 className="form-section-title">
            Step {step + 1} of {steps.length}: {steps[step]}
          </h2>

          {step === 0 && (
            <>
              <InfoList
                items={[
                  { label: 'Issue type', value: issueTypeLabels[issue.issueType] ?? issue.issueType },
                  { label: 'Setting', value: orDash(issue.setting) },
                  { label: 'Logged at', value: orDash(issue.loggedAt) },
                  { label: 'Date of birth', value: orDash(issue.dateOfBirth) },
                  { label: 'Gender', value: orDash(issue.gender) },
                  { label: 'Period of death', value: orDash(issue.periodOfDeath) },
                  { label: 'Date of death', value: orDash(issue.dateOfDeath) },
                  { label: 'Date of notification', value: orDash(issue.dateOfNotification) },
                  { label: 'Cause logged', value: orDash(issue.causeOfDeath) },
                  { label: 'Comments', value: orDash(issue.comments) },
                ]}
              />

              <h3 className="review-case__subtitle">Review</h3>
              <div className="form-row form-row--two">
                <DatePicker
                  datePickerType="single"
                  dateFormat="Y-m-d"
                  maxDate={today}
                  value={reviewDate}
                  onChange={(dates) => setReviewDate(toIsoDate(dates[0]))}
                >
                  <DatePickerInput
                    id="reviewDate"
                    labelText="Review date"
                    placeholder="yyyy-mm-dd"
                    invalid={showErrors && (reviewDate === '' || reviewDate > today)}
                    invalidText="Choose the review date (not in the future)"
                  />
                </DatePicker>
              </div>
            </>
          )}

          {step === 1 &&
            (isDeath ? (
              <>
                {loggedCause !== '' ? (
                  <>
                    <div className="review-case__logged">
                      <span>Cause chosen at logging</span>
                      <strong>{loggedCause}</strong>
                    </div>
                    <RadioButtonGroup
                      legendText="Should the cause of death be changed?"
                      name="changeCause"
                      valueSelected={changeCause}
                      onChange={(value) => {
                        setChangeCause(value as 'no' | 'yes');
                        if (value === 'no') setFinalCause(loggedCause);
                      }}
                      invalid={showErrors && changeCause === ''}
                      invalidText="Choose yes or no"
                    >
                      <RadioButton id="changeCause-no" labelText="No, keep it" value="no" />
                      <RadioButton id="changeCause-yes" labelText="Yes, change it" value="yes" />
                    </RadioButtonGroup>
                  </>
                ) : (
                  <p className="form-note">No cause was chosen at logging. Choose the final cause of death.</p>
                )}
                {(loggedCause === '' || changeCause === 'yes') && (
                  <>
                    <CauseFields
                      isDeath
                      causeOfDeath={finalCause}
                      causeOptions={causeOptions}
                      onCauseOfDeathChange={setFinalCause}
                    />
                    {showErrors && causeOptions.length > 0 && finalCause === '' && (
                      <p className="review-case__error">Choose the final cause of death</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <InlineNotification
                kind="info"
                lowContrast
                hideCloseButton
                title="Near miss"
                subtitle="Not a death, so there is no final cause. Continue to the contributing factors."
              />
            ))}

          {step === 2 && (
            <>
              <p className="form-note">
                If you change the factors of a level of delay, the recommendation logged for it is cleared and you
                write a new one in the next step.
              </p>
              <ContributingFactors
                delayLevels={delayLevels}
                selectedFactors={factors}
                showErrors={showErrors}
                onToggleFactor={toggleFactor}
              />
            </>
          )}

          {step === 3 && (
            <>
              <InlineNotification
                kind="info"
                lowContrast
                hideCloseButton
                title="Not sent yet"
                subtitle="When you complete the review, each recommendation goes to its responsible person."
              />
              <p className="form-note">
                There is one recommendation for each level of delay. For each one, choose the classification (it
                sets the date of completion), the level of implementation and the responsible person.
              </p>

              {sorted.map((item) => {
                const original = originalOf(item);
                const factorsOfDelay = delayGaps(factors).find((entry) => entry.delay === item.delay)?.factors;
                const cleared = item.startText !== '' && item.gap !== item.startGap;
                return (
                  <div key={item.key} className="review-rec">
                    <div className="review-rec__head">
                      <strong>{titleOf(item.delay)}</strong>
                      {original ? <StatusTag status={original.status} /> : <Tag type="purple">New</Tag>}
                      {item.code && <span className="form-note">{item.code}</span>}
                    </div>

                    <div className="review-rec__factors">
                      <span className="form-note">Gap identified</span>
                      {(factorsOfDelay ?? [item.gap]).map((factor) => (
                        <Tag key={factor} type="cool-gray" size="sm">
                          {factor}
                        </Tag>
                      ))}
                    </div>

                    {cleared && (
                      <InlineNotification
                        kind="warning"
                        lowContrast
                        hideCloseButton
                        title="The factors for this delay changed"
                        subtitle={`The logged recommendation was cleared. It said: "${item.startText}"`}
                      />
                    )}

                    <TextArea
                      id={`text-${item.key}`}
                      labelText="Recommendation"
                      rows={2}
                      value={item.text}
                      onChange={(event) => updateItem(item.key, { text: event.target.value })}
                      invalid={showErrors && item.text.trim() === ''}
                      invalidText="Write the recommendation"
                    />

                    <div className="form-row">
                      <Select
                        id={`class-${item.key}`}
                        labelText="Classification"
                        value={item.classification}
                        onChange={(event) => changeClassification(item, event.target.value as Classification | '')}
                        invalid={showErrors && item.classification === ''}
                        invalidText="Choose the classification"
                      >
                        <SelectItem value="" text="Choose a classification" />
                        {(Object.keys(classificationLabels) as Classification[]).map((key) => (
                          <SelectItem key={key} value={key} text={classificationLabels[key]} />
                        ))}
                      </Select>
                      <TextInput
                        id={`due-${item.key}`}
                        labelText="Date of completion (from classification)"
                        value={item.dueDate}
                        placeholder="Choose the classification first"
                        readOnly
                      />
                    </div>

                    <div className="form-row">
                      {!original || original.status === 'Pending review' ? (
                        <Select
                          id={`level-${item.key}`}
                          labelText="Level of implementation"
                          value={item.level}
                          onChange={(event) =>
                            updateItem(item.key, { level: event.target.value as Level | '', responsiblePersonId: '' })
                          }
                          invalid={showErrors && item.level === ''}
                          invalidText="Choose the level"
                        >
                          <SelectItem value="" text="Choose a level" />
                          {levelsFor(issue.issueType).map((key) => (
                            <SelectItem key={key} value={key} text={levelLabels[key]} />
                          ))}
                        </Select>
                      ) : (
                        <Select id={`level-${item.key}`} labelText="Level of implementation" value={item.level} disabled>
                          <SelectItem value={item.level} text={item.level ? levelLabels[item.level] : '—'} />
                        </Select>
                      )}
                      <Select
                        id={`person-${item.key}`}
                        labelText="Responsible person"
                        value={item.responsiblePersonId}
                        onChange={(event) => updateItem(item.key, { responsiblePersonId: event.target.value })}
                        helperText={
                          item.level ? `Only ${item.level} level staff in ${issueCounty || 'this county'}` : 'Choose the level first'
                        }
                        disabled={item.level === ''}
                        invalid={showErrors && item.level !== '' && item.responsiblePersonId === ''}
                        invalidText="Choose the responsible person"
                      >
                        <SelectItem value="" text="Choose a person" />
                        {responsiblePeople(users, locations, issue.loggedAt, item.level).map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            text={`${user.fullName} · ${user.cadre} · ${user.assignedLocations.join(', ')}`}
                          />
                        ))}
                      </Select>
                    </div>
                  </div>
                );
              })}

              {locked.map((recommendation) => (
                <div key={recommendation.code} className="review-rec review-rec--locked">
                  <div className="review-rec__head">
                    <strong>{recommendation.code}</strong>
                    <StatusTag status={recommendation.status} />
                    <span className="form-note">Can't be changed at this stage</span>
                  </div>
                  <p className="review-rec__text">{recommendation.text}</p>
                </div>
              ))}

              {showErrors && items.some((item) => itemProblem(item) !== '') && (
                <InlineNotification
                  kind="error"
                  lowContrast
                  hideCloseButton
                  title="Complete every recommendation"
                  subtitle="Each one needs the recommendation, classification, date of completion, level and responsible person."
                />
              )}
            </>
          )}

          {step === 4 && (
            <>
              <InfoList
                items={[
                  { label: 'Review date', value: reviewDate },
                  { label: 'Reviewed by', value: nameOf(userId) },
                  { label: 'Final cause of death', value: isDeath ? orDash(finalCause) : 'Not a death' },
                  { label: 'Contributing factors', value: `${factors.length} selected` },
                  { label: 'Recommendations', value: String(items.length + locked.length) },
                ]}
              />

              <h3 className="review-case__subtitle">Changes that will be saved in the history ({differences.length})</h3>
              {differences.length === 0 ? (
                <p className="empty-note">No changes to the logged record.</p>
              ) : (
                <ul className="review-case__changes">
                  {differences.map((change, index) => (
                    <li key={`${change.field}-${index}`}>
                      <strong>{change.field}</strong>
                      <span>
                        {change.from} → {change.to}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <InlineNotification
                kind="warning"
                lowContrast
                hideCloseButton
                title="Completing locks the review"
                subtitle="After this, the issue can't be edited, no recommendations can be added, and each recommendation is sent to its responsible person."
              />
            </>
          )}
        </section>

        <div className="log-issue__actions">
          <Button kind="ghost" onClick={() => (step === 0 ? navigate(`/issues/${issue.code}`) : goToStep(step - 1))}>
            {step === 0 ? 'Back to the issue' : 'Previous step'}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : step === lastStep ? 'Complete review' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ReviewCasePage;
