import { Tag } from '@carbon/react';
import InfoList from '../../../../components/shared/InfoList';

interface OverdueRecordProps {
  dueDate: string;
  dateMarkedOverdue: string;
  responsiblePerson: string;
  timesRedone: number;
}

// What the system recorded when the due date passed before completion.
function OverdueRecord({ dueDate, dateMarkedOverdue, responsiblePerson, timesRedone }: OverdueRecordProps) {
  return (
    <section className="form-card">
      <h2 className="form-section-title">Recorded by system</h2>

      <InfoList
        items={[
          { label: 'Due date', value: dueDate },
          { label: 'Date marked overdue', value: dateMarkedOverdue },
          { label: 'Current responsible person', value: responsiblePerson },
        ]}
      />

      <Tag type="outline">Redone {timesRedone} times</Tag>
    </section>
  );
}

export default OverdueRecord;
