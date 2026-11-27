import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, Form, InlineNotification, TextInput } from '@carbon/react';
import { AuthError, requestPasswordReset } from '../services/authApi';
import { EMAIL_PATTERN } from '../utils/passwordRules';
import AuthLayout from '../components/AuthLayout';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const emailError = email.trim() === '' ? 'Enter your email' : EMAIL_PATTERN.test(email.trim()) ? '' : 'Enter a valid email';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    setError('');
    if (emailError) return;

    setBusy(true);
    try {
      await requestPasswordReset(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <AuthLayout>
        <div className="login__form">
          <div>
            <h2>Check your email</h2>
            <p className="login__hint">
              If {sentTo} has an account, we've sent it a link to choose a new password. The link works once and
              expires in 30 minutes.
            </p>
          </div>
          <p className="login__hint">No email? Check your spam folder, or ask your system administrator.</p>
          <Link to="/login" className="login__link">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Form className="login__form" onSubmit={handleSubmit} noValidate aria-labelledby="forgot-title">
        <div>
          <h2 id="forgot-title">Forgot password</h2>
          <p className="login__hint">Enter your email and we'll send you a link to choose a new password.</p>
        </div>

        {error && <InlineNotification kind="error" title={error} role="alert" hideCloseButton lowContrast />}

        <TextInput
          id="forgot-email"
          labelText="Email"
          type="email"
          autoComplete="username"
          placeholder="name@example.com"
          size="md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          invalid={tried && emailError !== ''}
          invalidText={emailError}
          disabled={busy}
        />

        <Button type="submit" className="login__submit" disabled={busy}>
          {busy ? 'Sending...' : 'Send reset link'}
        </Button>

        <Link to="/login" className="login__link">
          Back to sign in
        </Link>
      </Form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;