import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="about-title" onClick={(event) => event.stopPropagation()}>
        <header className="modal__head">
          <h2 id="about-title">About Orbit</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <p>
          Orbit is a directory of social networks, messaging apps, creator tools and community platforms. Every
          Open button goes to the service’s official website in a new tab.
        </p>
        <p>
          Bookmarks are saved on this device only. Orbit never asks for passwords and never signs in to any service.
        </p>
      </div>
    </div>
  );
}
