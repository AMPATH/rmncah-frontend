import { InlineNotification } from '@carbon/react';

// Shown when a page can't load its data, e.g. json-server isn't running.
function ApiErrorNotice() {
  return (
    <div className="form-block">
      <InlineNotification
        kind="error"
        lowContrast
        hideCloseButton
        title="Can't reach the server"
        subtitle="Start it with npm run api in another terminal, then refresh the page."
      />
    </div>
  );
}

export default ApiErrorNotice;
