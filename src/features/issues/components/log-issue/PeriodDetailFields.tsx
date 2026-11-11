interface PeriodDetailFieldsProps {
  periodOfDeath: string;
  gestationWeeks: string;
  daysPostpartum: string;
  onPeriodOfDeathChange: (value: string) => void;
  onGestationWeeksChange: (value: string) => void;
  onDaysPostpartumChange: (value: string) => void;
}

// Step 4, first row: Period of death, then gestation or days postpartum.
function PeriodDetailFields({
  periodOfDeath,
  gestationWeeks,
  daysPostpartum,
  onPeriodOfDeathChange,
  onGestationWeeksChange,
  onDaysPostpartumChange,
}: PeriodDetailFieldsProps) {
  return (
    <div className="form-row form-row--two">
      <div className="field">
        <label htmlFor="periodOfDeath">Period of death</label>
        <select
          id="periodOfDeath"
          value={periodOfDeath}
          onChange={(event) => onPeriodOfDeathChange(event.target.value)}
          required
        >
          <option value="">Select period</option>
          <option value="antenatal">Antenatal</option>
          <option value="intrapartum">Intrapartum</option>
          <option value="postpartum">Postpartum</option>
        </select>
      </div>

      {periodOfDeath === 'postpartum' && (
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
          <span className="field-hint">0 to 42</span>
        </div>
      )}

      {(periodOfDeath === 'antenatal' || periodOfDeath === 'intrapartum') && (
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
