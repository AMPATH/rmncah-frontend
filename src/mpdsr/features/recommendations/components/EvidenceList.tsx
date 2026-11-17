import { Document } from '@carbon/icons-react';
import { useCurrentUser } from '../../../context/currentUserContext';
import { formatDateTime } from '../../../utils/dates';
import type { EvidenceFile } from '../services/evidenceService';
import { fileSizeText } from '../services/evidenceService';
import '../recommendations.scss';

// The files attached when the work was marked as done. Each one opens or downloads.
function EvidenceList({ files }: { files: EvidenceFile[] }) {
  const { users } = useCurrentUser();

  if (files.length === 0) {
    return <p className="empty-note">No evidence attached.</p>;
  }

  return (
    <ul className="evidence-list">
      {files.map((file) => (
        <li key={file.id}>
          <Document size={16} aria-hidden="true" />
          <span>
            <a className="cds--link" href={file.dataUrl} download={file.fileName}>
              {file.fileName}
            </a>
            <span className="evidence-list__meta">
              {fileSizeText(file.size)} · {formatDateTime(file.at)} ·{' '}
              {users.find((user) => user.id === file.byUserId)?.fullName ?? 'Unknown user'}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default EvidenceList;
