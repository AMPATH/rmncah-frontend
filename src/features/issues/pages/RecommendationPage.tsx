import { useState } from 'react';
import { showToast } from '../../../components/shared/toast/toast';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@carbon/react';
import AssignmentFields from '../components/recommendation/AssignmentFields';
import ClassificationFields from '../components/recommendation/ClassificationFields';
import CompletionFields from '../components/recommendation/CompletionFields';
import IdFields from '../components/recommendation/IdFields';
import RecommendationText from '../components/recommendation/RecommendationText';
import RoutingHint from '../components/recommendation/RoutingHint';
import type { Classification, Level, NewRecommendation, User } from '../types/issue.types';
import { addMonths, getToday } from '../utils/dates';

// The longest time each classification allows (from the workflow document).
const monthsAllowed: Record<Classification, number> = {
  immediate: 1,
  intermediate: 3,
  'long-term': 6,
};

function RecommendationPage() {
  const { id: issueId = '' } = useParams();
  const navigate = useNavigate();

  const [gap, setGap] = useState('');
  const [responsiblePersonId, setResponsiblePersonId] = useState('');
  const [text, setText] = useState('');
  const [classification, setClassification] = useState<Classification | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [dateOfCompletion, setDateOfCompletion] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  // Reference lists. They stay empty until the backend provides them.
  const gapOptions: string[] = [];
  const users: User[] = [];

  const today = getToday();

  // The latest allowed completion date: 1, 3 or 6 months from today.
  const latestCompletion = classification
    ? addMonths(today, monthsAllowed[classification])
    : '';

  // A new classification prefills the latest allowed date. The user may then pick earlier.
  function handleClassificationChange(newClassification: Classification | '') {
    setClassification(newClassification);
    setDateOfCompletion(
      newClassification ? addMonths(today, monthsAllowed[newClassification]) : ''
    );
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Which button was pressed: "Save recommendation" or "Add another".
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const addAnother = submitter?.name === 'add-another';

    if (classification === '' || level === '' || dateOfCompletion === '') {
      setShowErrors(true);
      return;
    }

    const recommendation: NewRecommendation = {
      issueId,
      gap,
      responsiblePersonId,
      text,
      classification,
      level,
      dateOfCompletion,
    };
    console.log('Recommendation to save:', recommendation);
    showToast(addAnother ? 'Recommendation saved. Add the next one.' : 'Recommendation saved');

    if (addAnother) {
      resetForm();
    } else {
      navigate('/mpdsr');
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Recommendation</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <IdFields issueId={issueId} />

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
          dateOfCompletion={dateOfCompletion}
          earliestDate={today}
          latestDate={latestCompletion}
          showErrors={showErrors}
          onDateOfCompletionChange={setDateOfCompletion}
        />

        <p className="form-note">
          Completion date is prefilled at 1, 3 or 6 months from date logged. It may be set
          earlier, never later.
        </p>

        <div className="form-actions">
          <Button type="submit" name="save">
            Save recommendation
          </Button>
          <Button type="submit" name="add-another" kind="secondary">
            Add another
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RecommendationPage;
