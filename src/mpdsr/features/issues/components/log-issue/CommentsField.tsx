import { TextArea } from '@carbon/react';

interface CommentsFieldProps {
  comments: string;
  onCommentsChange: (value: string) => void;
}

// Step 3: anything else the review team should know.
function CommentsField({ comments, onCommentsChange }: CommentsFieldProps) {
  return (
    <div className="form-block">
      <TextArea
        id="comments"
        labelText="Comments (optional)"
        rows={3}
        enableCounter
        maxCount={1000}
        value={comments}
        onChange={(event) => onCommentsChange(event.target.value)}
      />
    </div>
  );
}

export default CommentsField;
