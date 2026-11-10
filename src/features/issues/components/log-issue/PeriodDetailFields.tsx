interface PeriodDetailFieldsProps {
  periodOfDeath: string;
  gestationWeeks: string;
  daysPostpartum: string;
  onGestationWeeksChange: (value: string) => void;
  onDaysPostpartumChange: (value: string) => void;
}


function PeriodDetailFields({
  periodOfDeath,
  gestationWeeks,
  daysPostpartum,
  onGestationWeeksChange,
  onDaysPostpartumChange,
}: PeriodDetailFieldsProps) {
  return (
    <div className="form-row">
      {periodOfDeath === 'postpartum' ? (
        <div className="field">
          <label htmlFor="daysPostpartum">Days postpartum</label>
          <input
            id="daysPostpartum"
            type="number"
            min={0}
            max={42}
            value={daysPostpartum}
            onChange={(event) => onDaysPostpartumChange(event.target.value)}
            required
          />
        </div>
      ) : (
        <div className="field">
          <label htmlFor="gestationWeeks">Gestation at death (weeks)</label>
          <input
            id="gestationWeeks"
            type="number"
            min={1}
            max={45}
            value={gestationWeeks}
            onChange={(event) => onGestationWeeksChange(event.target.value)}
            required
          />
        </div>
      )}
    </div>
  );
}

export default PeriodDetailFields;
