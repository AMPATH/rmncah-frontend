import { Button, FileUploader, InlineNotification, TextArea } from '@carbon/react';
import type { FormEvent } from 'react';

interface MarkDoneFormProps {
  remarks: string;
  // Why the chosen file can't be used (wrong type or too big), or ''.
  evidenceError: string;
  blockedBecause: string;
  busy: boolean;
  onRemarksChange: (value: string) => void;
  onEvidenceChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// The person holding the recommendation says it's finished, optionally with a file as proof.
function MarkDoneForm({
  remarks,
  evidenceError,
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
        labelDescription="One PDF, JPG or PNG file, up to 2 MB"
        buttonLabel="Add file"
        buttonKind="tertiary"
        filenameStatus="edit"
        disabled={disabled}
        accept={['.pdf', '.jpg', '.jpeg', '.png']}
        onChange={(event) => onEvidenceChange((event.target as HTMLInputElement).files?.[0] ?? null)}
        onDelete={() => onEvidenceChange(null)}
      />
      {evidenceError && (
        <InlineNotification kind="error" lowContrast hideCloseButton title="This file can't be attached" subtitle={evidenceError} />
      )}

      <div className="form-actions">
        <Button type="submit" disabled={disabled || busy || evidenceError !== ''}>
          {busy ? 'Saving…' : 'Mark as done'}
        </Button>
      </div>
      {blockedBecause && <p className="field-hint">{blockedBecause}</p>}
    </form>
  );
}

export default MarkDoneForm;
