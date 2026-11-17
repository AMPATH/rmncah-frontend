import { TextInput } from '@carbon/react';
import AutoLabel from '../../../../components/shared/AutoLabel';

interface IdFieldsProps {
  issueId: string;
}

// Linked issue (auto) and Recommendation ID (auto). The user can't change either.
function IdFields({ issueId }: IdFieldsProps) {
  return (
    <div className="form-row">
      <TextInput id="linkedIssue" labelText={<AutoLabel text="Linked issue" />} value={issueId} readOnly />
      <TextInput
        id="recommendationId"
        labelText={<AutoLabel text="Recommendation ID" />}
        placeholder="Assigned by system"
        readOnly
      />
    </div>
  );
}

export default IdFields;
