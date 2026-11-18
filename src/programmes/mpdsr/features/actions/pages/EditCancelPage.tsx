import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, DatePicker, DatePickerInput, Select, SelectItem, TextArea } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import type { Classification } from '../../issues/types/issue.types';
import { addMonths, getToday, toIsoDate } from '../../../utils/dates';
import { useRecommendation } from '../../recommendations/hooks/useRecommendation';
import { whyBlocked } from '../../recommendations/utils/recommendationRules';
import { cancelRecommendation, editRecommendation } from '../../recommendations/services/recommendationService';
import RecommendationSummary from '../../recommendations/components/RecommendationSummary';
import RecommendationNotFound from '../../recommendations/components/RecommendationNotFound';

const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

function EditCancelPage() {
  const { id: code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { recommendation, issue, loading, failed } = useRecommendation(code);

  const [text, setText] = useState('');
  const [gap, setGap] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setText(recommendation.text);
      setGap(recommendation.gap);
      setDueDate(recommendation.dueDate);
    }
  }, [recommendation]);

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

  const editBlocked = whyBlocked('edit', recommendation, currentUser);
  const cancelBlocked = whyBlocked('cancel', recommendation, currentUser);
  const latestDueDate = addMonths(recommendation.dateLogged, monthsAllowed[recommendation.classification]);
  const unchanged = text.trim() === recommendation.text && gap === recommendation.gap && dueDate === recommendation.dueDate;
  const gapOptions = issue?.contributingFactors ?? [];

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

  function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim() === '' || dueDate === '') {
      setShowErrors(true);
      return;
    }
    run(
      () => editRecommendation(recommendation!, currentUser!.id, { text: text.trim(), gap, dueDate }),
      'Recommendation updated'
    );
  }

  function handleCancel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cancelReason.trim() === '') {
      setShowErrors(true);
      return;
    }
    run(() => cancelRecommendation(recommendation!, currentUser!.id, cancelReason.trim()), 'Recommendation cancelled');
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit or cancel</h1>
      </div>

      <RecommendationSummary recommendation={recommendation} />

      <div className="form-columns">
        <form className="form-card form-stack" onSubmit={handleEdit} noValidate>
          <h2 className="form-section-title">Edit</h2>
          <p className="form-note">Fix mistakes before work starts. The responsible person is told what changed.</p>

          <TextArea
            id="editText"
            labelText="Recommendation"
            rows={3}
            value={text}
            disabled={editBlocked !== ''}
            onChange={(event) => setText(event.target.value)}
            invalid={showErrors && text.trim() === ''}
            invalidText="Enter the recommendation"
          />

          <Select
            id="editGap"
            labelText="Gap identified"
            value={gap}
            disabled={editBlocked !== ''}
            onChange={(event) => setGap(event.target.value)}
          >
            <SelectItem value="" text="No gap selected" />
            {[...new Set([...gapOptions, recommendation.gap].filter(Boolean))].map((option) => (
              <SelectItem key={option} value={option} text={option} />
            ))}
          </Select>

          <DatePicker
            datePickerType="single"
            dateFormat="Y-m-d"
            minDate={getToday()}
            maxDate={latestDueDate}
            value={dueDate}
            onChange={(dates) => setDueDate(toIsoDate(dates[0]))}
          >
            <DatePickerInput
              id="editDueDate"
              labelText="Due date"
              placeholder="yyyy-mm-dd"
              helperText={`Latest allowed for this classification: ${latestDueDate}`}
              disabled={editBlocked !== ''}
              invalid={showErrors && dueDate === ''}
              invalidText="Choose the due date"
            />
          </DatePicker>

          <div>
            <Button type="submit" disabled={editBlocked !== '' || busy || unchanged}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
          {editBlocked && <p className="field-hint">{editBlocked}</p>}
        </form>

        <form className="form-card form-stack" onSubmit={handleCancel} noValidate>
          <h2 className="form-section-title">Cancel</h2>
          <p className="form-note">
            For a recommendation logged twice or no longer needed. It stays in the history as Cancelled.
          </p>

          <TextArea
            id="cancelReason"
            labelText="Reason for cancelling"
            rows={3}
            value={cancelReason}
            disabled={cancelBlocked !== ''}
            onChange={(event) => setCancelReason(event.target.value)}
            invalid={showErrors && cancelReason.trim() === ''}
            invalidText="Give the reason"
          />

          <div>
            <Button type="submit" kind="danger" disabled={cancelBlocked !== '' || busy}>
              {busy ? 'Saving…' : 'Cancel recommendation'}
            </Button>
          </div>
          {cancelBlocked && <p className="field-hint">{cancelBlocked}</p>}
        </form>
      </div>
    </div>
  );
}

export default EditCancelPage;
