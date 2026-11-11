import { Tag } from '@carbon/react';
import StatusTag from '../../../../components/shared/StatusTag';
import InfoList from '../../../../components/shared/InfoList';

interface OverdueRecordProps {
  timesRedone: number;
}

// What the system records when the due date passes before completion.
function OverdueRecord({ timesRedone }: OverdueRecordProps) {
  return (
    <section className="form-card">
      <h2 className="form-section-title">Recorded by system</h2>

      <InfoList
        items={[
          { label: 'Status', value: <StatusTag status="Overdue" /> },
          { label: 'Date marked overdue', value: '—' },
          { label: 'Previous responsible person', value: '—' },
          { label: 'Assigned to', value: 'PCN coordinator' },
        ]}
      />

      <Tag type="outline">Redone {timesRedone} times</Tag>
    </section>
  );
}

export default OverdueRecord;
