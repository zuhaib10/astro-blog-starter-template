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
  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-label="Choose a template"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden="true" />
        <div className="sheet-head">
          <h3>Send a template</h3>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
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
