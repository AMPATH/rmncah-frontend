import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Select, SelectItem, Tag, TextInput } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import type { Location, LocationType } from '../../../auth/locations';
import { showToast } from '../../../components/shared/toast/toast';
import { createLocation } from '../services/adminService';
import { parentTypeOf, placeTypeLabels } from '../utils/roleRules';
import '../admin.scss';

const placeTypes = Object.keys(placeTypeLabels) as LocationType[];

function PlaceBranch({ parent, locations, users }: { parent: string; locations: Location[]; users: Record<string, number> }) {
  const children = locations.filter((location) => location.parent === parent);
  if (children.length === 0) {
    return null;
  }
  return (
    <ul className="place-tree">
      {children.map((location) => (
        <li key={location.id}>
          <span className="place-tree__name">{location.name}</span>
          <Tag size="sm" type="outline">{placeTypeLabels[location.type]}</Tag>
          {users[location.name] > 0 && (
            <span className="place-tree__users">{users[location.name]} user(s)</span>
          )}
          <PlaceBranch parent={location.name} locations={locations} users={users} />
        </li>
      ))}
    </ul>
  );
}

function PlacesPage() {
  const { locations, users, reloadSetup } = useCurrentUser();
  const [name, setName] = useState('');
  const [type, setType] = useState<LocationType | ''>('');
  const [parent, setParent] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);

  const parentType = type === '' ? '' : parentTypeOf[type];
  const parentChoices = locations.filter((location) => location.type === parentType);
  const usersPerPlace: Record<string, number> = {};
  for (const user of users) {
    for (const place of user.assignedLocations) {
      usersPerPlace[place] = (usersPerPlace[place] ?? 0) + 1;
    }
  }

  const nameTaken = locations.some((location) => location.name.toLowerCase() === name.trim().toLowerCase());
  const nameError = name.trim() === '' ? 'Enter the name' : nameTaken ? 'A place with this name already exists' : '';
  const parentError = parentType !== '' && parent === '' ? `Choose the ${placeTypeLabels[parentType].toLowerCase()} it belongs to` : '';

  function changeType(value: LocationType | '') {
    setType(value);
    setParent('');
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameError || parentError || type === '') {
      setShowErrors(true);
      return;
    }
    setBusy(true);
    try {
      await createLocation({ name: name.trim(), type, parent });
      reloadSetup();
      showToast(`${name.trim()} added`);
      setName('');
      setType('');
      setParent('');
      setShowErrors(false);
    } catch {
      showToast("Couldn't save the place. Is the server running?", 'error');
    }
    setBusy(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Places</h1>
          <p className="page-subtitle">
            Counties, sub-counties, facilities and community units. Users see records at their places and
            everything under them.
          </p>
        </div>
      </div>

      <div className="admin-places">
        <section className="form-card">
          <h2 className="form-section-title">Hierarchy</h2>
          {locations.length === 0 ? (
            <p className="empty-note">No places yet. Start with a county.</p>
          ) : (
            <PlaceBranch parent="" locations={locations} users={usersPerPlace} />
          )}
        </section>

        <form className="form-card form-stack" onSubmit={handleAdd} noValidate>
          <h2 className="form-section-title">Add a place</h2>

          <Select
            id="placeType"
            labelText="Type"
            value={type}
            onChange={(event) => changeType(event.target.value as LocationType | '')}
            invalid={showErrors && type === ''}
            invalidText="Choose the type"
          >
            <SelectItem value="" text="Select type" />
            {placeTypes.map((placeType) => (
              <SelectItem key={placeType} value={placeType} text={placeTypeLabels[placeType]} />
            ))}
          </Select>

          {parentType !== '' && (
            <Select
              id="placeParent"
              labelText={`Belongs to (${placeTypeLabels[parentType].toLowerCase()})`}
              value={parent}
              onChange={(event) => setParent(event.target.value)}
              invalid={showErrors && parentError !== ''}
              invalidText={parentError}
              helperText={parentChoices.length === 0 ? `Add a ${placeTypeLabels[parentType].toLowerCase()} first` : undefined}
            >
              <SelectItem value="" text="Select" />
              {parentChoices.map((location) => (
                <SelectItem key={location.id} value={location.name} text={location.name} />
              ))}
            </Select>
          )}

          <TextInput
            id="placeName"
            labelText="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            invalid={showErrors && nameError !== ''}
            invalidText={nameError}
          />

          <div>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Add place'}
            </Button>
          </div>
          <p className="field-hint">
            Renaming and removing places come with the backend: records refer to places by name for now.
          </p>
        </form>
      </div>
    </div>
  );
}

export default PlacesPage;
