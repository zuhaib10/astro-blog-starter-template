import { useState } from "react";
import { countdownLabel, windowMinutesLeft } from "../format";

export default function Composer({
  windowOpen,
  lastInboundAt,
  sending,
  onSend,
  onOpenTemplates,
}: {
  windowOpen: boolean;
  lastInboundAt: string | null;
  sending: boolean;
  onSend: (text: string) => void;
  onOpenTemplates: () => void;
}) {
  const [text, setText] = useState("");

  if (!windowOpen) {
    return (
      <div className="composer closed">
        <p className="closed-note">
          <span aria-hidden="true">🔒</span> This chat is outside the 24-hour reply
          window. You can only send an approved template.
        </p>
        <button className="btn template-btn" onClick={onOpenTemplates}>
          Choose a template
        </button>
      </div>
    );
  }

  const left = windowMinutesLeft(lastInboundAt);
  const closingSoon = left > 0 && left < 120;

  const submit = () => {
    const value = text.trim();
    if (!value || sending) return;
    onSend(value);
    setText("");
  };

  return (
    <div className="composer">
      {closingSoon && (
        <p className="closing-hint">
          Free replies close in {countdownLabel(left)}
        </p>
      )}
      <div className="composer-row">
        <button
          className="icon-btn"
          onClick={onOpenTemplates}
          aria-label="Send a template"
          title="Send a template"
        >
          ⊞
        </button>
        <textarea
          className="composer-input"
          placeholder="Type a reply…"
          value={text}
          rows={1}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={!text.trim() || sending}
          aria-label="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
