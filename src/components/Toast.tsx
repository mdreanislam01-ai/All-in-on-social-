import { ArrowLeft, Check, X } from 'lucide-react';

export interface ToastMessage {
  title: string;
  description: string;
}

export function Toast({
  message,
  onDismiss,
  onBack,
}: {
  message: ToastMessage | null;
  onDismiss: () => void;
  onBack: () => void;
}) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-check"><Check size={15} strokeWidth={2.6} /></span>
      <div className="toast-copy">
        <strong>{message.title}</strong>
        <span>{message.description}</span>
      </div>
      <button type="button" className="toast-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to Orbit
      </button>
      <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss message">
        <X size={16} />
      </button>
    </div>
  );
}
