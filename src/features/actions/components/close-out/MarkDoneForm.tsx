import { Button, FileUploader, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';

interface MarkDoneFormProps {
  remarks: string;
  blockedBecause: string;
  busy: boolean;
  onRemarksChange: (value: string) => void;
  onEvidenceChange: (fileName: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// The person holding the recommendation says it's finished.
function MarkDoneForm({
  remarks,
  blockedBecause,
  busy,
  onRemarksChange,
  onEvidenceChange,
  onSubmit,
}: MarkDoneFormProps) {
  const disabled = blockedBecause !== '';

  return (
    <form className="form-card form-stack" onSubmit={onSubmit}>
      <h2 className="form-section-title">Mark as done</h2>
      <p className="form-note">By the person holding it</p>

      <TextArea
        id="remarks"
        labelText="Remarks on what was completed"
        rows={3}
        value={remarks}
        disabled={disabled}
        onChange={(event) => onRemarksChange(event.target.value)}
        required
      />

      <FileUploader
        labelTitle="Supporting evidence (optional)"
        labelDescription="PDF, JPG or PNG"
        buttonLabel="Add file"
        buttonKind="tertiary"
        filenameStatus="edit"
        disabled={disabled}
        accept={['.pdf', '.jpg', '.png']}
        onChange={(_event, data) => onEvidenceChange(data?.currentFiles[0]?.name ?? '')}
        onDelete={() => onEvidenceChange('')}
      />

      <div className="form-actions">
        <Button type="submit" disabled={disabled || busy}>
          {busy ? 'Saving…' : 'Mark as done'}
        </Button>
      </div>
      {blockedBecause && <p className="field-hint">{blockedBecause}</p>}
    </form>
  );
}

export default MarkDoneForm;
