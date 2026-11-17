import type { Setting } from '../../types/issue.types';
import AutoLabel from '../../../../components/shared/AutoLabel';

interface LocationFieldsProps {
  setting: Setting | '';
  loggedAt: string;
  loggedAtOptions: string[];
  subCounty: string;
  county: string;
  onSettingChange: (value: Setting | '') => void;
  onLoggedAtChange: (value: string) => void;
}

// Step 1: where the issue happened. Sub-county and county come from the location.
function LocationFields({
  setting,
  loggedAt,
  loggedAtOptions,
  subCounty,
  county,
  onSettingChange,
  onLoggedAtChange,
}: LocationFieldsProps) {
  return (
    <>
      <div className="form-row form-row--two">
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
          <span className="field-hint">
            Where it happened. Facility issues must be logged from that facility.
          </span>
        </div>

        <div className="field">
          <label htmlFor="loggedAt">Logged at</label>
          <select
            id="loggedAt"
            value={loggedAt}
            onChange={(event) => onLoggedAtChange(event.target.value)}
            disabled={setting === ''}
            required={loggedAtOptions.length > 0}
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
          <span className="field-hint">
            {setting === '' ? 'Choose a setting first.' : 'Only your assigned locations are listed.'}
          </span>
        </div>
      </div>

      <div className="form-row form-row--two">
        <div className="field">
          <label htmlFor="subCounty">
            <AutoLabel text="Sub-county" />
          </label>
          <input id="subCounty" type="text" value={subCounty} readOnly />
        </div>

        <div className="field">
          <label htmlFor="county">
            <AutoLabel text="County" />
          </label>
          <input id="county" type="text" value={county} readOnly />
        </div>
      </div>
    </>
  );
}

export default LocationFields;
