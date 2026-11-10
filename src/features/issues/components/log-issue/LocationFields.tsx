import type { IssueType, Setting } from '../../types/issue.types';

interface LocationFieldsProps {
  setting: Setting | '';
  loggedAt: string;
  issueType: IssueType | '';
  loggedAtOptions: string[];
  onSettingChange: (value: Setting | '') => void;
  onLoggedAtChange: (value: string) => void;
  onIssueTypeChange: (value: IssueType | '') => void;
}


function LocationFields({
  setting,
  loggedAt,
  issueType,
  loggedAtOptions,
  onSettingChange,
  onLoggedAtChange,
  onIssueTypeChange,
}: LocationFieldsProps) {
  return (
    <div className="form-row">
      <div className="field">
        <label htmlFor="setting">Setting</label>
        <select
          id="setting"
          value={setting}
          onChange={(event) => onSettingChange(event.target.value as Setting | '')}
          required
        >
          <option value="">Select setting</option>
          <option value="facility">Facility</option>
          <option value="community">Community</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="loggedAt">Logged at</label>
        <select
          id="loggedAt"
          value={loggedAt}
          onChange={(event) => onLoggedAtChange(event.target.value)}
          disabled={setting === ''}
          required
        >
          <option value="">
            {loggedAtOptions.length === 0 ? 'No locations assigned yet' : 'Select location'}
          </option>
          {loggedAtOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

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
      </div>
    </div>
  );
}

export default LocationFields;
