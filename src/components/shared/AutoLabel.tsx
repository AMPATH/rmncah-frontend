import './AutoLabel.scss';

interface AutoLabelProps {
  text: string;
}

// A field label with a small AUTO badge: the system fills this field, not the user.
function AutoLabel({ text }: AutoLabelProps) {
  return (
    <>
      {text}
      <span className="auto-label">AUTO</span>
    </>
  );
}

export default AutoLabel;
