interface CauseFieldsProps {
  isDeath: boolean;
  causeOfDeath: string;
  levelOfDelay: string;
  periodOfDeath: string;
  causeOptions: string[];
  onCauseOfDeathChange: (value: string) => void;
  onLevelOfDelayChange: (value: string) => void;
  onPeriodOfDeathChange: (value: string) => void;
}


function CauseFields({
  isDeath,
  causeOfDeath,
  levelOfDelay,
  periodOfDeath,
  causeOptions,
  onCauseOfDeathChange,
  onLevelOfDelayChange,
  onPeriodOfDeathChange,
}: CauseFieldsProps) {
  return (
    <div className="form-row">
      {isDeath && (
        <div className="field">
          <label htmlFor="causeOfDeath">Cause of death (ICD-11)</label>
          <input
            id="causeOfDeath"
            type="text"
            list="icd11-causes"
            placeholder="Type to search"
            value={causeOfDeath}
            onChange={(event) => onCauseOfDeathChange(event.target.value)}
            required
          />
          <datalist id="icd11-causes">
            {causeOptions.map((cause) => (
              <option key={cause} value={cause} />
            ))}
          </datalist>
        </div>
      )}

      <div className="field">
        <label htmlFor="levelOfDelay">Level of delay</label>
        <select
          id="levelOfDelay"
          value={levelOfDelay}
          onChange={(event) => onLevelOfDelayChange(event.target.value)}
          required
        >
          <option value="">Select level</option>
          <option value="1st">1st delay</option>
          <option value="2nd">2nd delay</option>
          <option value="3rd">3rd delay</option>
        </select>
      </div>

      {isDeath && (
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
      )}
    </div>
  );
}

export default CauseFields;
