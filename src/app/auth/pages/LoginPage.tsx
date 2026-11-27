import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button, Form, InlineNotification, PasswordInput, TextInput } from '@carbon/react';
import { AuthError } from '../services/authApi';
import { useAuth } from '../hooks/useAuth';
import { EMAIL_PATTERN } from '../utils/passwordRules';
import AuthLayout from '../components/AuthLayout';

interface LoginState {
  from?: string;
  notice?: string;
}

function LoginPage() {
  const { state, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { from = '/', notice = '' } = (location.state as LoginState | null) ?? {};

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (state.status === 'signedIn') return <Navigate to={from} replace />;

  const emailError = email.trim() === '' ? 'Enter your email' : EMAIL_PATTERN.test(email.trim()) ? '' : 'Enter a valid email';
  const passwordError = password === '' ? 'Enter your password' : '';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    setError('');
    if (emailError || passwordError) return;

    setBusy(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setPassword('');
      setError(
        err instanceof AuthError && err.status === 401
          ? 'Invalid email or password.'
          : err instanceof AuthError
            ? err.message
            : 'Something went wrong. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <Form className="login__form" onSubmit={handleSubmit} noValidate aria-labelledby="login-title">
        <div>
          <h2 id="login-title">Sign in</h2>
          <p className="login__hint">Use the email your administrator invited.</p>
        </div>

        {notice && !error && (
          <InlineNotification kind="success" title={notice} role="status" hideCloseButton lowContrast />
        )}
        {error && <InlineNotification kind="error" title={error} role="alert" hideCloseButton lowContrast />}

        <TextInput
          id="login-email"
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

        <PasswordInput
          id="login-password"
          labelText="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          size="md"
          hidePasswordLabel="Hide password"
          showPasswordLabel="Show password"
          tooltipAlignment="end"
          tooltipPosition="bottom"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          invalid={tried && passwordError !== ''}
          invalidText={passwordError}
          disabled={busy}
        />

        <Button type="submit" className="login__submit" disabled={busy}>
          {busy ? 'Signing in...' : 'Sign in'}
        </Button>

        <Link to="/forgot-password" className="login__link">
          Forgot password?
        </Link>
      </Form>
    </AuthLayout>
  );
}

export default LoginPage;