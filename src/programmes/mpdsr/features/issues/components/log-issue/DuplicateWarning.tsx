import { Link } from 'react-router';
import { InlineNotification } from '@carbon/react';
import type { StoredIssue } from '../../services/issueService';

interface DuplicateWarningProps {
  matches: StoredIssue[];
}

function DuplicateWarning({ matches }: DuplicateWarningProps) {
  if (matches.length === 0) return null;

  const codes = matches.map((issue) => issue.code).join(', ');
  const one = matches.length === 1;

  return (
    <div className="form-block duplicate-warning">
      <InlineNotification
        kind="warning"
        lowContrast
        hideCloseButton
        title="This may already be logged"
        subtitle={`${one ? 'Issue' : 'Issues'} ${codes} ${one ? 'has' : 'have'} the same type, place and date. Check before you submit. You can still continue if this is a different case.`}
      />
      <p className="form-note">
        {matches.map((issue) => (
          <Link
            key={issue.code}
            className="cds--link"
            style={{ marginRight: 16 }}
            to={`/issues/${issue.code}`}
            target="_blank"
            rel="noreferrer"
          >
            Open {issue.code}
          </Link>
        ))}
      </p>
    </div>
  );
}

export default DuplicateWarning;