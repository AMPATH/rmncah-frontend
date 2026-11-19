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
import RecommendationsStep from '../components/log-issue/RecommendationsStep';
import { delayLevels } from '../constants/delayFactors';
import { getIssues, getStoredRecommendations } from '../services/issueService';
import type { StoredIssue, StoredRecommendation } from '../services/issueService';
import { causeOptionsFor, getCausesOfDeath } from '../services/causeService';
import type { CauseOfDeath } from '../services/causeService';
import { completeCaseReview, reviewDifferences } from '../services/reviewService';
import type { ReviewedRecommendation } from '../services/reviewService';
import { isReviewed, maternalConditions } from '../utils/caseReview';
import { latestCompletionDate } from '../utils/classification';
import type { Classification, DraftRecommendation, Level } from '../types/issue.types';
import './LogIssuePage.scss';
import './ReviewCasePage.scss';

const steps = ['Case summary', 'Final cause', 'Contributing factors', 'Recommendations', 'Check and complete'];
const lastStep = steps.length - 1;
const editableStatuses = ['Pending review', 'Open', 'Pending acceptance', 'In progress'];

const issueTypeLabels: Record<string, string> = {
  perinatal: 'Perinatal',
  maternal: 'Maternal',
  'near-miss': 'Near miss',
};

const levelLabels: Record<Level, string> = {
  community: 'Community',
  facility: 'Facility',
  'sub-county': 'Sub-county',
  county: 'County',
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
  const { currentUser, users, scope } = useCurrentUser();
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
            ...(issue.issueType === 'perinatal'
              ? [{ label: 'Maternal condition', value: orDash(review.maternalCondition) }]
              : []),
          ]}
        />
      </section>
      <Link className="cds--link" to={`/issues/${issue.code}`}>
        Open {issue.code}
      </Link>
    </div>
  );
}

interface ReviewFormProps {
  issue: StoredIssue;
  recommendations: StoredRecommendation[];
  causeOptions: string[];
  userId: string;
  users: ReturnType<typeof useCurrentUser>['users'];
}

function ReviewForm({ issue, recommendations, causeOptions, userId, users }: ReviewFormProps) {
  const navigate = useNavigate();
  const today = getToday();
  const isDeath = issue.issueType !== 'near-miss';
  const isPerinatal = issue.issueType === 'perinatal';
  const people = users.filter((user) => user.role !== 'SYSTEM_ADMIN' && user.active !== false && user.deleted !== true);
  const nameOf = (id: string) => users.find((user) => user.id === id)?.fullName ?? '—';

  const [step, setStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);

  const loggedCause = issue.causeOfDeath ?? '';
  const [reviewDate, setReviewDate] = useState(today);
  const [changeCause, setChangeCause] = useState<'' | 'no' | 'yes'>('');
  const [finalCause, setFinalCause] = useState(loggedCause);
  const [maternalCondition, setMaternalCondition] = useState('');
  const [factors, setFactors] = useState<string[]>(issue.contributingFactors ?? []);
  const [edited, setEdited] = useState<ReviewedRecommendation[]>(() =>
    recommendations
      .filter((recommendation) => editableStatuses.includes(recommendation.status))
      .map((recommendation) => ({
        code: recommendation.code,
        text: recommendation.text,
        gap: recommendation.gap,
        classification: recommendation.classification,
        dueDate: recommendation.dueDate,
        responsiblePersonId: recommendation.responsiblePersonId,
        level: recommendation.level,
        removed: false,
      }))
  );
  const [added, setAdded] = useState<DraftRecommendation[]>([]);

  const locked = recommendations.filter((recommendation) => !editableStatuses.includes(recommendation.status));
  const kept = edited.filter((item) => !item.removed);
  const activeCount = kept.length + added.length + locked.length;
  const review = { reviewDate, finalCause, maternalCondition };
  const differences = reviewDifferences({
    issue,
    review,
    contributingFactors: factors,
    existing: recommendations,
    edited,
    added,
    users,
  });

  function updateEdited(code: string, changes: Partial<ReviewedRecommendation>) {
    setEdited((current) => current.map((item) => (item.code === code ? { ...item, ...changes } : item)));
  }

  function changeClassification(item: ReviewedRecommendation, classification: Classification) {
    const original = recommendations.find((recommendation) => recommendation.code === item.code)!;
    updateEdited(item.code, { classification, dueDate: latestCompletionDate(classification, original.dateLogged) });
  }

  function toggleFactor(factor: string) {
    setFactors((current) => (current.includes(factor) ? current.filter((item) => item !== factor) : [...current, factor]));
  }

  function recommendationProblem(item: { text: string; gap: string; responsiblePersonId: string; level: Level | '' }) {
    if (item.text.trim() === '') return 'Write the recommendation';
    if (item.level === '') return 'Choose the level of implementation';
    if (!factors.includes(item.gap)) return 'Choose a gap from the contributing factors in step 3';
    if (item.responsiblePersonId === '') return 'Choose the responsible person';
    return '';
  }

  function isStepComplete(index: number) {
    if (index === 0) {
      return reviewDate !== '' && reviewDate <= today;
    }
    if (index === 1) {
      const causeDone =
        !isDeath ||
        (loggedCause !== '' && changeCause === 'no') ||
        ((loggedCause === '' || changeCause === 'yes') && (causeOptions.length === 0 || finalCause !== ''));
      return causeDone && (!isPerinatal || maternalCondition !== '');
    }
    if (index === 2) {
      return factors.length > 0;
    }
    if (index === 3) {
      return activeCount > 0 && [...kept, ...added].every((item) => recommendationProblem(item) === '');
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

          {step === 1 && (
            <>
              {isDeath ? (
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
              )}

              {isPerinatal && (
                <RadioButtonGroup
                  legendText="Maternal condition (ICD-PM)"
                  name="maternalCondition"
                  orientation="vertical"
                  valueSelected={maternalCondition}
                  onChange={(value) => setMaternalCondition(String(value))}
                  helperText="The mother's condition that contributed to the baby's death."
                  invalid={showErrors && maternalCondition === ''}
                  invalidText="Choose the maternal condition"
                >
                  {maternalConditions.map((condition) => (
                    <RadioButton key={condition} id={`mc-${condition.slice(0, 2)}`} labelText={condition} value={condition} />
                  ))}
                </RadioButtonGroup>
              )}
            </>
          )}

          {step === 2 && (
            <ContributingFactors
              delayLevels={delayLevels}
              selectedFactors={factors}
              showErrors={showErrors}
              onToggleFactor={toggleFactor}
            />
          )}

          {step === 3 && (
            <>
              <h3 className="review-case__subtitle">Recommendations from the log</h3>
              <InlineNotification
                kind="info"
                lowContrast
                hideCloseButton
                title="Not sent yet"
                subtitle="These recommendations wait for your review. When you complete it, each one goes to its responsible person."
              />
              <p className="form-note">
                Choose the level of implementation and the responsible person for each one. You can also change the gap, text or classification, or remove one. The responsible person must work at the chosen level. Each must point to a
                factor from step 3. The due date follows the classification.
              </p>

              {edited.length === 0 && locked.length === 0 && <p className="empty-note">None were logged.</p>}

              {edited.map((item) => {
                const original = recommendations.find((recommendation) => recommendation.code === item.code)!;
                return (
                  <div key={item.code} className={`review-rec${item.removed ? ' review-rec--removed' : ''}`}>
                    <div className="review-rec__head">
                      <strong>{item.code}</strong>
                      <StatusTag status={original.status} />
                      {item.removed ? (
                        <Tag type="red">Will be cancelled</Tag>
                      ) : (
                        recommendationChangesCount(original, item) > 0 && <Tag type="blue">Changed</Tag>
                      )}
                      <Button
                        kind={item.removed ? 'ghost' : 'danger--ghost'}
                        size="sm"
                        onClick={() => updateEdited(item.code, { removed: !item.removed })}
                      >
                        {item.removed ? 'Undo remove' : 'Remove'}
                      </Button>
                    </div>
                    {!item.removed && (
                      <>
                        <Select
                          id={`gap-${item.code}`}
                          labelText="Gap identified"
                          value={factors.includes(item.gap) ? item.gap : ''}
                          onChange={(event) => updateEdited(item.code, { gap: event.target.value })}
                          invalid={showErrors && !factors.includes(item.gap)}
                          invalidText={item.gap ? `"${item.gap}" is no longer a factor` : 'Choose a gap'}
                        >
                          <SelectItem value="" text="Choose a factor from step 3" />
                          {factors.map((factor) => (
                            <SelectItem key={factor} value={factor} text={factor} />
                          ))}
                        </Select>
                        <TextArea
                          id={`text-${item.code}`}
                          labelText="Recommendation"
                          rows={2}
                          value={item.text}
                          onChange={(event) => updateEdited(item.code, { text: event.target.value })}
                          invalid={showErrors && item.text.trim() === ''}
                          invalidText="Write the recommendation"
                        />
                        <div className="form-row">
                          <Select
                            id={`class-${item.code}`}
                            labelText="Classification"
                            value={item.classification}
                            onChange={(event) => changeClassification(item, event.target.value as Classification)}
                          >
                            {(Object.keys(classificationLabels) as Classification[]).map((key) => (
                              <SelectItem key={key} value={key} text={classificationLabels[key]} />
                            ))}
                          </Select>
                          <TextInput id={`due-${item.code}`} labelText="Due date (from classification)" value={item.dueDate} readOnly />
                        </div>
                        <div className="form-row">
                          {original.status === 'Pending review' ? (
                            <Select
                              id={`level-${item.code}`}
                              labelText="Level of implementation"
                              value={item.level}
                              onChange={(event) =>
                                updateEdited(item.code, { level: event.target.value as Level | '', responsiblePersonId: '' })
                              }
                              invalid={showErrors && item.level === ''}
                              invalidText="Choose the level"
                            >
                              <SelectItem value="" text="Choose a level" />
                              {(Object.keys(levelLabels) as Level[]).map((key) => (
                                <SelectItem key={key} value={key} text={levelLabels[key]} />
                              ))}
                            </Select>
                          ) : (
                            <TextInput id={`level-${item.code}`} labelText="Level of implementation" value={item.level} readOnly />
                          )}
                          <Select
                            id={`person-${item.code}`}
                            labelText="Responsible person"
                            value={item.responsiblePersonId}
                            onChange={(event) => updateEdited(item.code, { responsiblePersonId: event.target.value })}
                            helperText={item.level ? `Only ${item.level} level staff` : 'Choose the level first'}
                            disabled={item.level === ''}
                            invalid={showErrors && item.level !== '' && item.responsiblePersonId === ''}
                            invalidText="Choose the responsible person"
                          >
                            <SelectItem value="" text="Choose a person" />
                            {people
                              .filter((user) => user.level === item.level)
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id} text={`${user.fullName} · ${user.cadre}`} />
                              ))}
                          </Select>
                        </div>
                      </>
                    )}
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

              <h3 className="review-case__subtitle">Add recommendations</h3>
              <RecommendationsStep
                recommendations={added}
                gapOptions={factors}
                users={people}
                today={today}
                showErrors={false}
                onAdd={(draft) => setAdded((current) => [...current, draft])}
                onRemove={(index) => setAdded((current) => current.filter((_, position) => position !== index))}
              />

              {showErrors && activeCount === 0 && (
                <InlineNotification
                  kind="error"
                  lowContrast
                  hideCloseButton
                  title="Add at least one recommendation"
                  subtitle="Every reviewed case needs at least one recommendation."
                />
              )}
              {showErrors && added.some((draft) => recommendationProblem(draft) !== '') && (
                <InlineNotification
                  kind="error"
                  lowContrast
                  hideCloseButton
                  title="Check the added recommendations"
                  subtitle="Each needs a gap from step 3 and a responsible person. Remove it and add it again."
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
                  ...(isPerinatal ? [{ label: 'Maternal condition', value: orDash(maternalCondition) }] : []),
                  { label: 'Contributing factors', value: `${factors.length} selected` },
                  { label: 'Recommendations after the review', value: String(activeCount) },
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
                subtitle="After this, the issue can't be edited, and each recommendation is sent to its responsible person."
              />
            </>
          )}
        </section>

        <div className="log-issue__actions">
          <Button kind="ghost" onClick={() => (step === 0 ? navigate(`/issues/${issue.code}`) : goToStep(step - 1))}>
            {step === 0 ? 'Cancel review' : 'Previous step'}
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : step === lastStep ? 'Complete review' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function recommendationChangesCount(original: StoredRecommendation, item: ReviewedRecommendation) {
  return [
    item.text !== original.text,
    item.gap !== original.gap,
    item.classification !== original.classification,
    item.level !== original.level,
    item.responsiblePersonId !== original.responsiblePersonId,
  ].filter(Boolean).length;
}

export default ReviewCasePage;
