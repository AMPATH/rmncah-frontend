import { Button, MultiSelect, Select, SelectItem, TextInput } from '@carbon/react';
import type { FormEvent } from 'react';
import type { Role } from '../../../auth/permissions';
import { roleDescriptions, roleLabels } from '../../../auth/permissions';
import type { Location } from '../../../auth/locations';
import { placeTypeForLevel, placeTypeLabels, roleLevels, roleNeedsPlaces } from '../utils/roleRules';

export interface UserFormValues {
  fullName: string;
  cadre: string;
  email: string;
  role: Role | '';
  assignedLocations: string[];
}

interface UserFormProps {
  values: UserFormValues;
  locations: Location[];
  errors: Partial<Record<keyof UserFormValues, string>>;
  busy: boolean;
  submitLabel: string;
  onChange: (values: UserFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

const roles = Object.keys(roleLabels) as Role[];

function UserForm({ values, locations, errors, busy, submitLabel, onChange, onSubmit, onCancel }: UserFormProps) {
  const placeType = values.role === '' ? null : placeTypeForLevel[roleLevels[values.role]];
  const placeChoices = locations.filter((location) => location.type === placeType);
  const selectedPlaces = placeChoices.filter((location) => values.assignedLocations.includes(location.name));

  function set<K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) {
    onChange({ ...values, [field]: value });
  }

  function changeRole(role: Role | '') {
    onChange({ ...values, role, assignedLocations: [] });
  }

  return (
    <form className="form-card form-stack admin-form" onSubmit={onSubmit} noValidate>
      <TextInput
        id="fullName"
        labelText="Full name"
        value={values.fullName}
        onChange={(event) => set('fullName', event.target.value)}
        invalid={Boolean(errors.fullName)}
        invalidText={errors.fullName}
      />

      <TextInput
        id="cadre"
        labelText="Cadre"
        placeholder="e.g. Midwife, Clinical officer"
        value={values.cadre}
        onChange={(event) => set('cadre', event.target.value)}
        invalid={Boolean(errors.cadre)}
        invalidText={errors.cadre}
      />

      <TextInput
        id="email"
        type="email"
        labelText="Email"
        value={values.email}
        onChange={(event) => set('email', event.target.value)}
        invalid={Boolean(errors.email)}
        invalidText={errors.email}
      />

      <Select
        id="role"
        labelText="Role"
        value={values.role}
        onChange={(event) => changeRole(event.target.value as Role | '')}
        invalid={Boolean(errors.role)}
        invalidText={errors.role}
        helperText={values.role === '' ? undefined : roleDescriptions[values.role]}
      >
        <SelectItem value="" text="Select role" />
        {roles.map((role) => (
          <SelectItem key={role} value={role} text={roleLabels[role]} />
        ))}
      </Select>

      {roleNeedsPlaces(values.role) && placeType && (
        <MultiSelect<Location>
          key={values.role}
          id="assignedLocations"
          titleText={`Assigned ${placeTypeLabels[placeType].toLowerCase()}(s)`}
          label={selectedPlaces.length === 0 ? `Select ${placeTypeLabels[placeType].toLowerCase()}` : 'Selected'}
          items={placeChoices}
          itemToString={(item) => item?.name ?? ''}
          selectedItems={selectedPlaces}
          onChange={({ selectedItems }) =>
            set('assignedLocations', (selectedItems ?? []).map((item) => item.name))
          }
          invalid={Boolean(errors.assignedLocations)}
          invalidText={errors.assignedLocations}
          helperText={
            placeChoices.length === 0
              ? `No ${placeTypeLabels[placeType].toLowerCase()} yet. Add one under Places.`
              : 'They see records at these places and everything under them.'
          }
        />
      )}

      <div className="form-actions">
        <Button kind="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default UserForm;
