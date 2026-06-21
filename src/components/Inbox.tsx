import type { ConversationSummary } from "../types";
import ConversationRow from "./ConversationRow";

type Filter = "waiting" | "all";

export default function Inbox({
  conversations,
  loading,
  selectedId,
  onSelect,
  filter,
  onFilter,
  source,
}: {
  conversations: ConversationSummary[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  filter: Filter;
  onFilter: (f: Filter) => void;
  source: "live" | "demo";
}) {
  const waiting = conversations.filter((c) => c.unread > 0);
  const base = filter === "waiting" ? waiting : conversations;
  // Longest-waiting first: unanswered on top, then by wait time descending.
  const list = [...base].sort((a, b) => {
    const aw = a.unread > 0 ? 1 : 0;
    const bw = b.unread > 0 ? 1 : 0;
    if (aw !== bw) return bw - aw;
    return (b.waitMinutes ?? 0) - (a.waitMinutes ?? 0);
  });

  return (
    <div className="inbox">
      <header className="inbox-head">
        <div className="inbox-title">
          <h1>Chats</h1>
          <span className={`conn ${source === "live" ? "live" : "demo"}`}>
            {source === "live" ? "Connected" : "Demo"}
          </span>
        </div>
        <div className="segmented" role="group" aria-label="Filter conversations">
          <button
            aria-pressed={filter === "waiting"}
            className={filter === "waiting" ? "active" : ""}
            onClick={() => onFilter("waiting")}
          >
            Waiting{waiting.length > 0 ? ` · ${waiting.length}` : ""}
          </button>
          <button
            aria-pressed={filter === "all"}
            className={filter === "all" ? "active" : ""}
            onClick={() => onFilter("all")}
          >
            All
          </button>
        </div>
      </header>

      <div className="inbox-list">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div className="convo-skeleton" key={i}>
              <span className="sk-avatar" />
              <span className="sk-lines">
                <span className="sk-line" />
                <span className="sk-line short" />
              </span>
            </div>
          ))
        ) : conversations.length === 0 ? (
          <div className="inbox-empty">
            <div className="empty-emoji" aria-hidden="true">💬</div>
            <p className="empty-title">No conversations yet</p>
            <p className="empty-sub">
              When a customer messages your WhatsApp number, they'll appear here.
              Your number is connected and listening.
            </p>
          </div>
        ) : list.length === 0 ? (
          <div className="inbox-empty">
            <div className="empty-emoji" aria-hidden="true">✅</div>
            <p className="empty-title">You're all caught up</p>
            <p className="empty-sub">Every customer has a reply. Nice work.</p>
          </div>
        ) : (
          list.map((c) => (
            <ConversationRow
              key={c.id}
              c={c}
              active={c.id === selectedId}
              onClick={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
