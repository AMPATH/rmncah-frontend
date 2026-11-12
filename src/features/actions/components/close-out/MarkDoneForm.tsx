import { Button, FileUploader, TextArea } from '@carbon/react';
import StatusTag from '../../../../components/shared/StatusTag';
import type { FormEvent } from 'react';

interface MarkDoneFormProps {
  remarks: string;
  submitted: boolean;
  onRemarksChange: (value: string) => void;
  onEvidenceChange: (fileName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}


function MarkDoneForm({
  remarks,
  submitted,
  onRemarksChange,
  onEvidenceChange,
  onSubmit,
}: MarkDoneFormProps) {
  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Mark as done</h2>
      <p className="form-note">By the person holding it</p>

      <TextArea
        id="remarks"
        labelText="Remarks on what was completed"
        rows={3}
        value={remarks}
        onChange={(event) => onRemarksChange(event.target.value)}
        required
      />

      <FileUploader
        labelTitle="Supporting evidence (optional)"
        labelDescription="PDF, JPG or PNG"
        buttonLabel="Add file"
        buttonKind="tertiary"
        filenameStatus="edit"
        accept={['.pdf', '.jpg', '.png']}
        onChange={(_event, data) => onEvidenceChange(data?.currentFiles[0]?.name ?? '')}
        onDelete={() => onEvidenceChange('')}
      />

      <div className="form-actions">
        <Button type="submit">Mark as done</Button>
        {submitted && <StatusTag status="Pending approval" />}
      </div>
    </form>
  );
}

export default MarkDoneForm;
