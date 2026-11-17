import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, DataTableSkeleton, NumberInput } from '@carbon/react';
import { useApiData } from '../../../hooks/useApiData';
import { showToast } from '../../../components/shared/toast/toast';
import type { Level } from '../../issues/types/issue.types';
import {
  defaultEscalationMatrix,
  getEscalationMatrix,
  saveEscalationMatrix,
} from '../../recommendations/services/escalationMatrix';
import type { EscalationMatrix } from '../../recommendations/services/escalationMatrix';
import '../admin.scss';

const levels: { level: Level; label: string }[] = [
  { level: 'community', label: 'Community' },
  { level: 'facility', label: 'Facility' },
  { level: 'sub-county', label: 'Sub-county' },
  { level: 'county', label: 'County' },
];

const MIN_DAYS = 1;
const MAX_DAYS = 30;

// Admin: how many days each level has to accept a recommendation before it goes to the
// PCN coordinator. Notifications and the Accept page use these numbers.
function EscalationMatrixPage() {
  const { data: saved, loading, reload } = useApiData<EscalationMatrix>(getEscalationMatrix, defaultEscalationMatrix);
  const [matrix, setMatrix] = useState<EscalationMatrix>(defaultEscalationMatrix);
  const [busy, setBusy] = useState(false);

  // Show the saved numbers once they have loaded.
  useEffect(() => {
    // Hydrate the editable matrix after the server value loads.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatrix(saved);
  }, [saved]);

  const invalid = levels.some(({ level }) => {
    const days = matrix[level];
    return !Number.isInteger(days) || days < MIN_DAYS || days > MAX_DAYS;
  });
  const changed = levels.some(({ level }) => matrix[level] !== saved[level]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (invalid) {
      return;
    }
    setBusy(true);
    try {
      await saveEscalationMatrix(matrix);
      reload();
      showToast('Escalation matrix saved');
    } catch {
      showToast("Couldn't save the escalation matrix. Is the server running?", 'error');
    }
    setBusy(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Escalation matrix</h1>
          <p className="page-subtitle">
            Days the responsible person has to accept a recommendation. If it isn't accepted in time, it goes
            to the PCN coordinator.
          </p>
        </div>
      </div>

      {loading ? (
        <DataTableSkeleton columnCount={2} rowCount={4} showHeader={false} showToolbar={false} />
      ) : (
        <form className="form-card form-stack admin-form" onSubmit={handleSave} noValidate>
          {levels.map(({ level, label }) => (
            <NumberInput
              key={level}
              id={`days-${level}`}
              label={`${label}: days to accept`}
              min={MIN_DAYS}
              max={MAX_DAYS}
              step={1}
              value={matrix[level]}
              invalidText={`Enter a whole number from ${MIN_DAYS} to ${MAX_DAYS}`}
              onChange={(_event, { value }) =>
                setMatrix((current) => ({ ...current, [level]: Number(value) }))
              }
            />
          ))}

          <div className="form-actions">
            <Button kind="secondary" disabled={!changed || busy} onClick={() => setMatrix(saved)}>
              Undo changes
            </Button>
            <Button type="submit" disabled={!changed || invalid || busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <p className="field-hint">
            New deadlines apply to notifications sent from now on. Reminders and the move to the PCN
            coordinator are run by the server.
          </p>
        </form>
      )}
    </div>
  );
}

export default EscalationMatrixPage;
