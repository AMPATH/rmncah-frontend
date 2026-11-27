import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button, InlineLoading, InlineNotification, Tag } from '@carbon/react';
import { AuthError, getSessions, logoutAll, revokeSession, type AuthSession } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import { deviceName } from '../utils/deviceName';
import AuthLayout from '../components/AuthLayout';

function when(iso: string | null) {
  if (!iso) return 'Not yet';
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function messageOf(error: unknown) {
  return error instanceof AuthError ? error.message : 'Something went wrong. Try again.';
}

// Where this account is signed in, with a way to sign out one device or all of them.
function SessionsPage() {
  const { state, endSession } = useAuth();
  const thisSession = state.status === 'signedIn' ? state.user.sessionId : undefined;

  const [sessions, setSessions] = useState<AuthSession[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSessions()
      .then((list) => {
        if (!cancelled) setSessions(list);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(messageOf(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOutOne(session: AuthSession) {
    setBusyId(session.id);
    setError('');
    setNotice('');
    try {
      await revokeSession(session.id);
      setSessions((current) => (current ?? []).filter((s) => s.id !== session.id));
      setNotice(`${deviceName(session.userAgent)} has been signed out.`);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setBusyId('');
    }
  }

  async function signOutAll() {
    setBusyId('all');
    setError('');
    try {
      await logoutAll();
      endSession('You are signed out on every device.');
    } catch (err) {
      setError(messageOf(err));
      setBusyId('');
    }
  }

  const others = (sessions ?? []).filter((s) => s.id !== thisSession).length;

  return (
    <AuthLayout>
      <div className="login__form">
        <div>
          <h2>Signed-in devices</h2>
          <p className="login__hint">
            Where your account is signed in now. If you see a device you don't recognise, sign it out and change your
            password.
          </p>
        </div>

        {notice && <InlineNotification kind="success" title={notice} role="status" hideCloseButton lowContrast />}
        {error && <InlineNotification kind="error" title={error} role="alert" hideCloseButton lowContrast />}

        {sessions === null && !error && <InlineLoading description="Loading your devices..." />}

        {sessions !== null && (
          <ul className="auth-sessions" aria-label="Signed-in devices">
            {sessions.map((session) => {
              const isThis = session.id === thisSession;
              return (
                <li key={session.id} className="auth-sessions__item">
                  <div>
                    <div className="auth-sessions__name">
                      {deviceName(session.userAgent)}
                      {isThis && (
                        <Tag type="green" size="sm">
                          This device
                        </Tag>
                      )}
                    </div>
                    <p className="login__hint">
                      Signed in {when(session.createdAt)} · Last active {when(session.lastUsedAt)}
                      {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                    </p>
                  </div>
                  {!isThis && (
                    <Button
                      kind="ghost"
                      size="sm"
                      onClick={() => void signOutOne(session)}
                      disabled={busyId !== ''}
                    >
                      {busyId === session.id ? 'Signing out...' : 'Sign out'}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {sessions !== null && (
          <Button kind="danger--tertiary" className="login__submit" onClick={() => void signOutAll()} disabled={busyId !== ''}>
            {busyId === 'all' ? 'Signing out...' : others > 0 ? 'Sign out of all devices' : 'Sign out'}
          </Button>
        )}

        <Link to="/" className="login__link">
          Back
        </Link>
      </div>
    </AuthLayout>
  );
}

export default SessionsPage;
