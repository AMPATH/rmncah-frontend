import { useSyncExternalStore } from 'react';
import { ToastNotification } from '@carbon/react';
import { dismissToast, getToasts, subscribe } from './toast';
import './ToastHost.scss';


function ToastHost() {
  const toasts = useSyncExternalStore(subscribe, getToasts);

  return (
    <div className="toast-host" aria-live="polite">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          kind={toast.kind}
          title={toast.title}
          lowContrast
          onClose={() => {
            dismissToast(toast.id);
            return false;
          }}
        />
      ))}
    </div>
  );
}

export default ToastHost;
