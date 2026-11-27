import { useNavigate } from 'react-router';
import { Button, ClickableTile, InlineNotification, Theme } from '@carbon/react';
import { ArrowRight } from '@carbon/icons-react';
import { useAuth } from '../auth/hooks/useAuth';
import { canOpenProgramme } from '../auth/utils/programmeAccess';
import type { ProgrammeModule } from '../auth/services/authApi';
import './ProgrammeSelectPage.scss';

const programmes: { path: string; name: string; fullName: string; description: string; code: string; module: ProgrammeModule }[] = [
  {
    path: '/mpdsr',
    name: 'MPDSR',
    fullName: 'Maternal and Perinatal Death Surveillance and Response',
    description:
      'Coordinate maternal and perinatal death reviews, track recommendations, and monitor responses.',
    code: '01',
    module: 'MPDSR',
  },
  {
    path: '/emonc/',
    name: 'EmONC',
    fullName: 'Emergency Obstetric and Newborn Care',
    description:
      'Access mentorship, training modules, learning resources, and facility-based support.',
    code: '02',
    module: 'EMONC',
  },
];

function ProgrammeSelectPage() {
  const navigate = useNavigate();
  const { state, signOut } = useAuth();
  const user = state.status === 'signedIn' ? state.user : null;
  const firstName = user?.firstName ?? '';
  const available = programmes.filter((programme) => canOpenProgramme(user, programme.module));

  return (
    <Theme theme="g10" className="programme-select">
      <main className="programme-select__content">
        <header className="programme-select__header">
          <p className="programme-select__eyebrow">
            AMPATH · RMNCAH PROGRAMMES
          </p>
          <h1>{firstName ? `Welcome, ${firstName}` : 'Welcome'}</h1>
          <p className="programme-select__subtitle">
            Select a programme to continue to your workspace.
          </p>
        </header>

        <section
          className="programme-select__options"
          aria-label="Available programmes"
        >
          {available.length === 0 && (
            <InlineNotification
              kind="info"
              lowContrast
              hideCloseButton
              title="No programmes yet"
              subtitle="Your account has no programme roles. Ask your system administrator for access."
            />
          )}
          {available.map((programme) => (
            <ClickableTile
              key={programme.path}
              className="programme-select__tile"
              href={programme.path}
              onClick={(event) => {
                event.preventDefault();
                navigate(programme.path);
              }}
            >
              <div className="programme-select__tile-content">
                <span className="programme-select__number">
                  {programme.code}
                </span>

                <div className="programme-select__details">
                  <h2>{programme.name}</h2>
                  <p className="programme-select__fullname">
                    {programme.fullName}
                  </p>
                  <p className="programme-select__description">
                    {programme.description}
                  </p>
                </div>

                <ArrowRight
                  size={24}
                  className="programme-select__arrow"
                  aria-hidden="true"
                />
              </div>
            </ClickableTile>
          ))}
        </section>

        <footer className="programme-select__footer">
          <p>Maternal and Newborn Health Programmes</p>
          <p>AMPATH</p>
          <span className="programme-select__account">
            <Button kind="ghost" size="sm" onClick={() => navigate('/change-password')}>
              Change password
            </Button>
            <Button kind="ghost" size="sm" onClick={() => navigate('/sessions')}>
              Signed-in devices
            </Button>
            <Button kind="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </span>
        </footer>
      </main>
    </Theme>
  );
}

export default ProgrammeSelectPage;
