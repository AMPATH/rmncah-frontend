import './AutoLabel.scss';

interface AutoLabelProps {
  text: string;
}


function AutoLabel({ text }: AutoLabelProps) {
  return (
    <>
      {text}
      <span className="auto-label">AUTO</span>
    </>
  );
}

export default AutoLabel;
