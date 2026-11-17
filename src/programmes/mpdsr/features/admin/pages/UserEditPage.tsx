import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, DataTableSkeleton, InlineNotification, Modal } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { useApiData } from '../../../hooks/useApiData';
import { showToast } from '../../../components/shared/toast/toast';
import { getStoredRecommendations } from '../../issues/services/issueService';
import type { StoredRecommendation } from '../../issues/services/issueService';
import UserForm from '../components/UserForm';
import type { UserFormValues } from '../components/UserForm';
import { createUser, setUserActive, updateUser } from '../services/adminService';
import { roleLevels } from '../utils/roleRules';
import { validateUser } from '../utils/validateUser';
import '../admin.scss';

const emptyUser: UserFormValues = { fullName: '', cadre: '', email: '', role: '', assignedLocations: [] };

// Admin: add a user (/admin/users/new) or change one (/admin/users/:id).
function UserEditPage() {
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { users, locations, ready, reloadSetup } = useCurrentUser();
  const existing = users.find((user) => user.id === id);
  const isActive = existing?.active !== false;

  // Recommendations this user still holds, so the admin knows what needs a new owner.
  const recommendationsData = useApiData<StoredRecommendation[]>(getStoredRecommendations, []);
  const stillHolding = recommendationsData.data.filter(
    (recommendation) => recommendation.responsiblePersonId === id && recommendation.status !== 'Closed' && recommendation.status !== 'Cancelled'
  );

  const [values, setValues] = useState<UserFormValues>(emptyUser);
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Fill the form once the user being edited has loaded.
  useEffect(() => {
    if (existing) {
      // Populate the edit form when the selected user becomes available.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        fullName: existing.fullName ?? '',
        cadre: existing.cadre ?? '',
        email: existing.email ?? '',
        role: existing.role,
        assignedLocations: existing.assignedLocations ?? [],
      });
    }
  }, [existing]);

  const errors = validateUser(values, users, isNew ? null : id);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.keys(errors).length > 0 || values.role === '') {
      setShowErrors(true);
      return;
    }

    const user = {
      fullName: values.fullName.trim(),
      cadre: values.cadre.trim(),
      email: values.email.trim().toLowerCase(),
      role: values.role,
      level: roleLevels[values.role],
      assignedLocations: values.assignedLocations,
    };

    setBusy(true);
    try {
      if (isNew) {
        await createUser(user);
      } else {
        await updateUser(id, user);
      }
      reloadSetup();
      showToast(isNew ? `${user.fullName} added` : `${user.fullName} updated`);
      navigate('/admin/users');
    } catch {
      showToast("Couldn't save the user. Is the server running?", 'error');
      setBusy(false);
    }
  }

  // Deactivate (after confirming) or reactivate the user.
  async function changeActive(active: boolean) {
    setConfirming(false);
    setBusy(true);
    try {
      await setUserActive(id, active);
      reloadSetup();
      showToast(active ? `${existing?.fullName} reactivated` : `${existing?.fullName} deactivated`);
    } catch {
      showToast("Couldn't change the user. Is the server running?", 'error');
    }
    setBusy(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isNew ? 'Add user' : existing?.fullName ?? 'Edit user'}</h1>
      </div>

      {!ready ? (
        <DataTableSkeleton columnCount={2} rowCount={5} showHeader={false} showToolbar={false} />
      ) : !isNew && !existing ? (
        <InlineNotification kind="warning" lowContrast hideCloseButton title="User not found" />
      ) : (
        <>
          {!isActive && (
            <InlineNotification
              kind="warning"
              lowContrast
              hideCloseButton
              title="This user is deactivated"
              subtitle="They keep their history, but can't be chosen for new work or use the system."
            />
          )}

          <UserForm
            values={values}
            locations={locations}
            errors={showErrors ? errors : {}}
            busy={busy}
            submitLabel={isNew ? 'Add user' : 'Save changes'}
            onChange={setValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/users')}
          />

          {!isNew && (
            <section className="form-card form-stack admin-form admin-account">
              <h2 className="form-section-title">Account</h2>
              {isActive ? (
                <>
                  <p className="field-hint">
                    When someone leaves, deactivate them instead of deleting: their history stays, and they
                    are no longer offered as a responsible person.
                  </p>
                  <div>
                    <Button kind="danger--tertiary" disabled={busy} onClick={() => setConfirming(true)}>
                      Deactivate user
                    </Button>
                  </div>
                </>
              ) : (
                <div>
                  <Button kind="tertiary" disabled={busy} onClick={() => changeActive(true)}>
                    Reactivate user
                  </Button>
                </div>
              )}
            </section>
          )}

          <Modal
            open={confirming}
            danger
            modalHeading={`Deactivate ${existing?.fullName ?? 'this user'}?`}
            primaryButtonText="Deactivate"
            secondaryButtonText="Cancel"
            onRequestClose={() => setConfirming(false)}
            onRequestSubmit={() => changeActive(false)}
          >
            <p>They keep their history, but can't be chosen for new work or use the system.</p>
            {stillHolding.length > 0 && (
              <p className="admin-account__warning">
                They still hold {stillHolding.length} recommendation(s) that aren't closed (
                {stillHolding.map((recommendation) => recommendation.code).join(', ')}). Once these go overdue,
                the PCN coordinator can reassign them.
              </p>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

export default UserEditPage;
