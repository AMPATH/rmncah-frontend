import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, Form, InlineNotification } from '@carbon/react';
import { acceptInvitation, AuthError, resetPassword } from '../services/authApi';
import NewPasswordFields from '../components/NewPasswordFields';
import { newPasswordProblem } from '../utils/passwordRules';
import AuthLayout from '../components/AuthLayout';

// The page an email link opens: an invitation (/accept-invitation) or a reset (/reset-password).
// Both carry ?token= and only ask for a new password.
const MODES = {
  invitation: {
    title: 'Set up your account',
    hint: 'Choose a password to activate your account. You will use it with your email to sign in.',
    button: 'Activate account',
    busy: 'Activating...',
    done: 'Your account is active. Sign in with your new password.',
    badLink: 'This invitation link is missing its code. Open the link from your invitation email again, or ask your system administrator to resend it.',
    save: acceptInvitation,
  },
  reset: {
    title: 'Choose a new password',
    hint: 'Your new password replaces the old one and signs you out everywhere.',
    button: 'Save new password',
    busy: 'Saving...',
    done: 'Your password has been changed. Sign in with your new password.',
    badLink: 'This reset link is missing its code. Open the link from your email again, or request a new one.',
    save: resetPassword,
  },
};

function SetPasswordPage({ mode }: { mode: keyof typeof MODES }) {
  const text = MODES[mode];
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // Read the code from the link once, then take it out of the address bar and browser history,
  // so nobody using this computer later can find it there.
  const [token] = useState(() => params.get('token') ?? '');
  useEffect(() => {
    if (params.has('token')) setParams({}, { replace: true });
  }, [params, setParams]);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    setError('');
    if (newPasswordProblem(password, confirm)) return;

    setBusy(true);
    try {
      await text.save(token, password);
      navigate('/login', { replace: true, state: { notice: text.done } });
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  }

  const expired = /invalid or expired/i.test(error);

  return (
    <AuthLayout>
      <Form className="login__form" onSubmit={handleSubmit} noValidate aria-labelledby="set-title">
        <div>
          <h2 id="set-title">{text.title}</h2>
          <p className="login__hint">{text.hint}</p>
        </div>

        {token === '' ? (
          <InlineNotification kind="error" title="Link not valid" subtitle={text.badLink} hideCloseButton lowContrast />
        ) : (
          <>
            {error && (
              <InlineNotification
                kind="error"
                title={error}
                subtitle={
                  expired
                    ? mode === 'invitation'
                      ? 'Invitations last 24 hours. Ask your system administrator to resend it.'
                      : 'Reset links last 30 minutes and work once. Request a new one.'
                    : undefined
                }
                role="alert"
                hideCloseButton
                lowContrast
              />
            )}

            <NewPasswordFields
              password={password}
              confirm={confirm}
              onPassword={setPassword}
              onConfirm={setConfirm}
              tried={tried}
              disabled={busy}
              label="Password"
            />

            <Button type="submit" className="login__submit" disabled={busy}>
              {busy ? text.busy : text.button}
            </Button>
          </>
        )}

        {mode === 'reset' && (token === '' || expired) && (
          <Link to="/forgot-password" className="login__link">
            Request a new reset link
          </Link>
        )}
        <Link to="/login" className="login__link">
          Back to sign in
        </Link>
      </Form>
    </AuthLayout>
  );
}

export default SetPasswordPage;
