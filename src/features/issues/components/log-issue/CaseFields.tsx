import type { IssueType, Setting } from '../../types/issue.types';

interface CaseFieldsProps {
  setting: Setting | '';
  issueType: IssueType | '';
  onIssueTypeChange: (value: IssueType | '') => void;
}

// Step 2, first row: the issue type.
function CaseFields({ setting, issueType, onIssueTypeChange }: CaseFieldsProps) {
  return (
    <div className="form-row form-row--two">
      <div className="field">
        <label htmlFor="issueType">Issue type</label>
        <select
          id="issueType"
          value={issueType}
          onChange={(event) => onIssueTypeChange(event.target.value as IssueType | '')}
          required
        >
          <option value="">Select issue type</option>
          <option value="perinatal">Perinatal</option>
          <option value="maternal">Maternal</option>
          {setting === 'facility' && <option value="near-miss">Near miss</option>}
        </select>
        {setting !== 'facility' && (
          <span className="field-hint">
            Near miss is only available when the setting is facility.
          </span>
        )}
      </div>
    </div>
  );
}

export default CaseFields;
