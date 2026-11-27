import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, Form, InlineNotification, PasswordInput } from '@carbon/react';
import { AuthError, changePassword } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import NewPasswordFields from '../components/NewPasswordFields';
import { newPasswordProblem } from '../utils/passwordRules';
import AuthLayout from '../components/AuthLayout';


function ChangePasswordPage() {
  const { state, signOut, endSession } = useAuth();
  const forced = state.status === 'signedIn' && state.user.mustChangePassword;

  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sameAsCurrent = current !== '' && password === current;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    setError('');
    if (current === '' || sameAsCurrent || newPasswordProblem(password, confirm)) return;

    setBusy(true);
    try {
      await changePassword(current, password);
     
      endSession('Your password has been changed. Sign in again with your new password.');
    } catch (err) {
      setCurrent('');
      setError(
        err instanceof AuthError && err.status === 401
          ? 'Your current password is incorrect.'
          : err instanceof AuthError
            ? err.message
            : 'Something went wrong. Try again.',
      );
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Form className="login__form" onSubmit={handleSubmit} noValidate aria-labelledby="change-title">
        <div>
          <h2 id="change-title">{forced ? 'Choose your own password' : 'Change password'}</h2>
          <p className="login__hint">
            {forced
              ? 'Your account needs a new password before you continue.'
              : 'After the change you will be signed out on every device and sign in again.'}
          </p>
        </div>

        {error && <InlineNotification kind="error" title={error} role="alert" hideCloseButton lowContrast />}

        <PasswordInput
          id="current-password"
          labelText="Current password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          size="md"
          hidePasswordLabel="Hide password"
          showPasswordLabel="Show password"
          tooltipAlignment="end"
          tooltipPosition="bottom"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          invalid={tried && current === ''}
          invalidText="Enter your current password"
          disabled={busy}
        />

        <NewPasswordFields
          password={password}
          confirm={confirm}
          onPassword={setPassword}
          onConfirm={setConfirm}
          tried={tried}
          disabled={busy}
        />
        {tried && sameAsCurrent && (
          <p className="login__error">The new password must be different from the current one.</p>
        )}

        <Button type="submit" className="login__submit" disabled={busy}>
          {busy ? 'Saving...' : 'Change password'}
        </Button>

        {forced ? (
          <Button kind="ghost" className="login__submit" onClick={() => void signOut()} disabled={busy}>
            Sign out
          </Button>
        ) : (
          <Link to="/" className="login__link">
            Cancel
          </Link>
        )}
      </Form>
    </AuthLayout>
  );
}

export default ChangePasswordPage;