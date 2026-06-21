import type { ConversationSummary } from "../types";
import { waitLabel, waitLevel } from "../format";

export default function ConversationRow({
  c,
  active,
  onClick,
}: {
  c: ConversationSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`convo-row ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="convo-avatar" aria-hidden="true">
        {c.name.charAt(0)}
      </span>
      <span className="convo-main">
        <span className="convo-top">
          <span className="convo-name">{c.name}</span>
          <span
            className={`wait-chip ${waitLevel(c.waitMinutes)}`}
            aria-label={`waiting ${waitLabel(c.waitMinutes)}`}
          >
            {waitLabel(c.waitMinutes)}
          </span>
        </span>
        <span className="convo-bottom">
          <span className="convo-preview">
            {!c.windowOpen && (
              <span className="lock" title="24-hour window closed" aria-label="window closed">
                🔒
              </span>
            )}
            {c.preview}
          </span>
          {c.unread > 0 && (
            <span className="badge" aria-label={`${c.unread} unread`}>
              {c.unread}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
