interface CommentsFieldProps {
  comments: string;
  onCommentsChange: (value: string) => void;
}


function CommentsField({ comments, onCommentsChange }: CommentsFieldProps) {
  return (
    <div className="field">
      <label htmlFor="comments">Comments (optional)</label>
      <textarea
        id="comments"
        rows={3}
        value={comments}
        onChange={(event) => onCommentsChange(event.target.value)}
      />
    </div>
  );
}

export default CommentsField;
