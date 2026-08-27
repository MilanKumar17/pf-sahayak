"use client";

import { ReactNode, useEffect, useRef } from "react";

type JourneyModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export default function JourneyModal({ title, children, onClose }: JourneyModalProps) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="journey-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button ref={closeButton} className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-content">{children}</div>
        <button className="modal-done" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}
