import { useState } from 'react';
import {
  Button,
  InlineNotification,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@carbon/react';
import type { Classification, DraftRecommendation, Level, User } from '../../types/issue.types';
import { latestCompletionDate } from '../../utils/classification';
import AssignmentFields from '../recommendation/AssignmentFields';
import ClassificationFields from '../recommendation/ClassificationFields';
import CompletionFields from '../recommendation/CompletionFields';
import RecommendationText from '../recommendation/RecommendationText';
import RoutingHint from '../recommendation/RoutingHint';
import './RecommendationsStep.scss';

interface RecommendationsStepProps {
  recommendations: DraftRecommendation[];
  gapOptions: string[];
  users: User[];
  today: string;
  showErrors: boolean;
  onAdd: (recommendation: DraftRecommendation) => void;
  onRemove: (index: number) => void;
}

// Step 5: add one or more recommendations. They are saved together with the issue.
function RecommendationsStep({
  recommendations,
  gapOptions,
  users,
  today,
  showErrors,
  onAdd,
  onRemove,
}: RecommendationsStepProps) {
  // The recommendation being typed. It joins the list when "Add recommendation" is pressed.
  const [gap, setGap] = useState('');
  const [responsiblePersonId, setResponsiblePersonId] = useState('');
  const [text, setText] = useState('');
  const [classification, setClassification] = useState<Classification | ''>('');
  const [level, setLevel] = useState<Level | ''>('');
  const [dateOfCompletion, setDateOfCompletion] = useState('');
  const [showDraftErrors, setShowDraftErrors] = useState(false);

  const latestCompletion = latestCompletionDate(classification, today);

  function handleClassificationChange(newClassification: Classification | '') {
    setClassification(newClassification);
    setDateOfCompletion(latestCompletionDate(newClassification, today));
  }

  function handleAdd() {
    if (text.trim() === '' || classification === '' || level === '' || dateOfCompletion === '') {
      setShowDraftErrors(true);
      return;
    }

    onAdd({ gap, responsiblePersonId, text: text.trim(), classification, level, dateOfCompletion });

    setGap('');
    setResponsiblePersonId('');
    setText('');
    setClassification('');
    setLevel('');
    setDateOfCompletion('');
    setShowDraftErrors(false);
  }

  return (
    <>
      {recommendations.length > 0 && (
        <Table aria-label="Recommendations added" size="md">
          <TableHead>
            <TableRow>
              <TableHeader>#</TableHeader>
              <TableHeader>Recommendation</TableHeader>
              <TableHeader>Classification</TableHeader>
              <TableHeader>Level</TableHeader>
              <TableHeader>Due</TableHeader>
              <TableHeader>Routing</TableHeader>
              <TableHeader>
                <span className="cds--visually-hidden">Remove</span>
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {recommendations.map((recommendation, index) => (
              <TableRow key={index}>
                <TableCell>R{index + 1}</TableCell>
                <TableCell>
                  {recommendation.text}
                  {recommendation.gap && (
                    <div className="recommendations-step__gap">Gap: {recommendation.gap}</div>
                  )}
                </TableCell>
                <TableCell>{recommendation.classification}</TableCell>
                <TableCell>{recommendation.level}</TableCell>
                <TableCell>{recommendation.dateOfCompletion}</TableCell>
                <TableCell>
                  {recommendation.level === 'sub-county' || recommendation.level === 'county'
                    ? 'Needs acceptance'
                    : 'Auto-assigned'}
                </TableCell>
                <TableCell>
                  <Button kind="danger--ghost" size="sm" onClick={() => onRemove(index)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="recommendations-step__add">
        <h3 className="recommendations-step__title">Add recommendation</h3>

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
          showErrors={showDraftErrors}
          onDateOfCompletionChange={setDateOfCompletion}
        />

        {showDraftErrors && (
          <p className="recommendations-step__error">
            Fill in the recommendation, classification, level and date of completion.
          </p>
        )}

        <Button kind="tertiary" onClick={handleAdd}>
          Add recommendation
        </Button>
      </div>

      {showErrors && recommendations.length === 0 && (
        <InlineNotification
          kind="error"
          lowContrast
          hideCloseButton
          title="Add at least one recommendation"
          subtitle="Every issue needs a plan of action before it can be submitted."
        />
      )}
    </>
  );
}

export default RecommendationsStep;
