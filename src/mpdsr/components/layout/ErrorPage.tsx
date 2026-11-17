import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@carbon/react';
import { Home, Renew } from '@carbon/icons-react';
import './ErrorPage.scss';

interface ErrorPageProps {
  // True when the whole layout failed (no top bar to show around the message).
  fullPage?: boolean;
}

// Shown instead of a page when it breaks. Users get a plain message and a way out;
// developers also see the error itself while running `npm run dev`.
function ErrorPage({ fullPage = false }: ErrorPageProps) {
  const error = useRouteError();
  const details = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : String(error);

  const message = (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <p className="error-page__text">
        This page couldn't be shown. Your saved work is safe. Try reloading, or go back to the Overview.
      </p>
      <div className="error-page__actions">
        <Button renderIcon={Renew} onClick={() => window.location.reload()}>
          Reload
        </Button>
        {/* A full page load clears whatever broke, unlike moving within the app. */}
        <Button kind="tertiary" renderIcon={Home} onClick={() => window.location.assign('/mpdsr')}>
          Go to Overview
        </Button>
      </div>
      {import.meta.env.DEV && (
        <details className="error-page__details">
          <summary>Details for developers</summary>
          <pre>{details}</pre>
        </details>
      )}
    </div>
  );

  // Every MPDSR style is scoped to .mpdsr-app; when the layout itself failed, add the wrapper here.
  return fullPage ? <div className="mpdsr-app error-page--full">{message}</div> : message;
}

export default ErrorPage;
