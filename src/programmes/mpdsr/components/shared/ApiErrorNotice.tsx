import { InlineNotification } from '@carbon/react';

function ApiErrorNotice() {
  return (
    <div className="form-block">
      <InlineNotification
        kind="error"
        lowContrast
        hideCloseButton
        title="Can't reach the server"
        subtitle="Please check your internet connection and try again."
      />
    </div>
  );
}

export default ApiErrorNotice;
