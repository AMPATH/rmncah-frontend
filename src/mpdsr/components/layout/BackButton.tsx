import { useNavigate } from 'react-router';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';

interface BackButtonProps {
  
  inline?: boolean;
}


function BackButton({ inline = false }: BackButtonProps) {
  const navigate = useNavigate();

  function handleBack() {
    
    const historyIndex = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (historyIndex > 0) {
      navigate(-1);
    } else {
      navigate('/mpdsr');
    }
  }

  const button = (
    <Button className="back-button no-print" kind="ghost" onClick={handleBack}>
      <ArrowLeft size={16} />
      Back
    </Button>
  );

  return inline ? button : <div className="back-bar no-print">{button}</div>;
}

export default BackButton;
