import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, DatePicker, DatePickerInput, TextArea, TextInput } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import ApiErrorNotice from '../../../components/shared/ApiErrorNotice';
import { showToast } from '../../../components/shared/toast/toast';
import { getToday, toIsoDate } from '../../../utils/dates';
import { latestCompletionDate } from '../../issues/utils/classification';
import { useRecommendation } from '../../recommendations/hooks/useRecommendation';
import { whyBlocked } from '../../recommendations/utils/recommendationRules';
import { editRecommendation } from '../../recommendations/services/recommendationService';
import RecommendationSummary from '../../recommendations/components/RecommendationSummary';
import RecommendationNotFound from '../../recommendations/components/RecommendationNotFound';

// Recommendations can be edited before work starts. They can never be cancelled.
function EditCancelPage() {
  const { id: code = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const { recommendation, loading, failed } = useRecommendation(code);

  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (recommendation) {
      setText(recommendation.text);
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
  // Before the case review there is no classification yet, so the chair sets the date there.
  const latestDueDate = latestCompletionDate(recommendation.classification, recommendation.dateLogged);
  const unchanged = text.trim() === recommendation.text && dueDate === recommendation.dueDate;

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (text.trim() === '' || (latestDueDate !== '' && dueDate === '')) {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    try {
      await editRecommendation(recommendation!, currentUser!.id, { text: text.trim(), gap: recommendation!.gap, dueDate });
      showToast('Recommendation updated');
      navigate(`/recommendations/${code}`);
    } catch {
      showToast("Couldn't save. Is the server running?", 'error');
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Edit recommendation</h1>
      </div>

      <RecommendationSummary recommendation={recommendation} />

      <form className="form-card form-stack" onSubmit={handleEdit} noValidate>
        <p className="form-note">Fix mistakes before work starts. The responsible person is told what changed.</p>

        <TextInput id="editGap" labelText="Gap identified" value={recommendation.gap || '—'} readOnly />

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

        {latestDueDate === '' ? (
          <p className="form-note">The facility MPDSR chair sets the date of completion at the case review.</p>
        ) : (
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
              labelText="Date of completion"
              placeholder="yyyy-mm-dd"
              helperText={`Latest allowed for this classification: ${latestDueDate}`}
              disabled={editBlocked !== ''}
              invalid={showErrors && dueDate === ''}
              invalidText="Choose the date of completion"
            />
          </DatePicker>
        )}

        <div>
          <Button type="submit" disabled={editBlocked !== '' || busy || unchanged}>
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
        {editBlocked && <p className="field-hint">{editBlocked}</p>}
      </form>
    </div>
  );
}

export default EditCancelPage;
