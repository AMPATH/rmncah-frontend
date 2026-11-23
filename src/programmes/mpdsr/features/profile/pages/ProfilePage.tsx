import { Link } from 'react-router';
import { InlineNotification } from '@carbon/react';
import { useCurrentUser } from '../../../context/currentUserContext';
import LoadingCards from '../../../components/shared/LoadingCards';
import { initialsOf } from '../utils/profileFigures';
import './ProfilePage.scss';

function ProfilePage() {
  const { currentUser, ready } = useCurrentUser();

  if (ready && !currentUser) {
    return (
      <div className="page">
        <InlineNotification
          kind="info"
          lowContrast
          hideCloseButton
          title="Not signed in"
          subtitle='Open the profile icon (top right) and pick a user under "Acting as".'
        />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="page">
        <LoadingCards count={1} />
      </div>
    );
  }

  return (
    <div className="page profile">
      <div className="page-header">
        <h1>My profile</h1>
      </div>

      <section className="profile__card">
        <div className="profile__identity">
          <div className="profile__avatar" aria-hidden="true">
            {initialsOf(currentUser.fullName)}
          </div>
          <h2 className="profile__name">{currentUser.fullName}</h2>
        </div>

        <h3 className="profile__heading">Contact</h3>
        <dl className="profile__list">
          <dt>Email</dt>
          <dd>{currentUser.email || '—'}</dd>
          <dt>Cadre</dt>
          <dd>{currentUser.cadre || '—'}</dd>
          <dt>Places assigned to</dt>
          <dd>{currentUser.assignedLocations.join(', ') || '—'}</dd>
        </dl>
      </section>

      <p className="form-note">
        {currentUser.role === 'SYSTEM_ADMIN' ? (
          <>
            You can change any account under <Link className="cds--link" to={`/admin/users/${currentUser.id}`}>Users</Link>.
          </>
        ) : (
          'To change your details, contact your system administrator.'
        )}
      </p>
    </div>
  );
}

export default ProfilePage;