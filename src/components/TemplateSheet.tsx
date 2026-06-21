import { useEffect, useRef } from "react";
import type { Template } from "../types";

export default function TemplateSheet({
  open,
  templates,
  onClose,
  onPick,
}: {
  open: boolean;
  templates: Template[];
  onClose: () => void;
  onPick: (name: string) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Move focus into the sheet on open and close on Escape.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Choose a template"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <h3>Send a template</h3>
          <button ref={closeRef} className="sheet-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="sheet-note">
          Outside the 24-hour window only approved templates can be sent.
        </p>
        <ul className="template-list">
          {templates.map((t) => {
            const approved = t.status === "Approved";
            return (
              <li key={t.name}>
                <button
                  className="template-item"
                  disabled={!approved}
                  onClick={() => approved && onPick(t.name)}
                >
                  <span className="template-main">
                    <span className="template-name mono">{t.name}</span>
                    <span className="template-meta">
                      {t.category} · {t.language.toUpperCase()}
                    </span>
                  </span>
                  <span className={`pill ${t.status.toLowerCase()}`}>{t.status}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
