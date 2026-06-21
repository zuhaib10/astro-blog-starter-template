import { useEffect, useRef, useState } from "react";
import type { Template, Thread as ThreadData, ThreadMessage } from "../types";
import { fetchThread, sendReply } from "../api";
import { isWindowOpen, timeLabel } from "../format";
import Composer from "./Composer";
import TemplateSheet from "./TemplateSheet";

function Ticks({ status }: { status: ThreadMessage["status"] }) {
  if (status === "sending") return <span className="tick sending" aria-label="sending">🕓</span>;
  if (status === "failed") return <span className="tick failed" aria-label="failed">!</span>;
  const double = status === "delivered" || status === "read";
  return (
    <span className={`tick ${status}`} aria-label={status}>
      {double ? "✓✓" : "✓"}
    </span>
  );
}

export default function Thread({
  conversationId,
  templates,
  onBack,
  onSent,
}: {
  conversationId: number;
  templates: Template[];
  onBack: () => void;
  onSent: () => void;
}) {
  const [thread, setThread] = useState<ThreadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchThread(conversationId).then((t) => {
      if (!cancelled) {
        setThread(t);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  const pushMessage = (msg: ThreadMessage) =>
    setThread((t) => (t ? { ...t, messages: [...t.messages, msg] } : t));

  const updateMessage = (id: ThreadMessage["id"], patch: Partial<ThreadMessage>) =>
    setThread((t) =>
      t
        ? { ...t, messages: t.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }
        : t,
    );

  async function deliver(
    payload: { text?: string; template?: string },
    optimisticBody: string,
  ) {
    const tempId = `temp-${Date.now()}`;
    pushMessage({
      id: tempId,
      direction: "outbound",
      body: optimisticBody,
      status: "sending",
      createdAt: new Date().toISOString(),
    });
    setSending(true);
    const res = await sendReply(conversationId, payload);
    setSending(false);
    if (res.ok && res.message) {
      updateMessage(tempId, { ...res.message });
      onSent();
    } else {
      updateMessage(tempId, { status: "failed" });
      setToast(res.error ?? "Message failed to send");
    }
  }

  // Auto-dismiss the error toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading || !thread) {
    return (
      <div className="thread">
        <div className="thread-body">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`bubble-skeleton ${i % 2 ? "out" : "in"}`} />
          ))}
        </div>
      </div>
    );
  }

  const { conversation, messages } = thread;
  // One derived window state for both the banner and the composer.
  const windowOpen = isWindowOpen(conversation.lastInboundAt, conversation.windowOpen);

  return (
    <div className="thread">
      <header className="thread-head">
        <button className="back-btn" onClick={onBack} aria-label="Back to inbox">
          ‹
        </button>
        <div className="thread-avatar" aria-hidden="true">
          {conversation.name.charAt(0)}
        </div>
        <div className="thread-id">
          <strong>{conversation.name}</strong>
          <small>{conversation.phone}</small>
        </div>
      </header>

      <div className={`window-banner ${windowOpen ? "open" : "closed"}`}>
        {windowOpen
          ? "Reply window open — free replies allowed"
          : "Window closed — only approved templates can be sent"}
      </div>

      <div className="thread-body">
        {messages.map((m) => (
          <div key={m.id} className={`bubble ${m.direction}`}>
            <span className="bubble-text">{m.body}</span>
            <span className="bubble-meta">
              {timeLabel(m.createdAt)}
              {m.direction === "outbound" && <Ticks status={m.status} />}
            </span>
            {m.status === "failed" && (
              <button
                className="retry"
                onClick={() => deliver({ text: m.body }, m.body)}
              >
                Tap to retry
              </button>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {toast && (
        <div className="toast" role="alert" onClick={() => setToast(null)}>
          {toast}
        </div>
      )}

      <Composer
        windowOpen={windowOpen}
        lastInboundAt={conversation.lastInboundAt}
        sending={sending}
        onSend={(t) => deliver({ text: t }, t)}
        onOpenTemplates={() => setSheetOpen(true)}
      />

      <TemplateSheet
        open={sheetOpen}
        templates={templates}
        onClose={() => setSheetOpen(false)}
        onPick={(name) => {
          setSheetOpen(false);
          deliver({ template: name }, `Template sent: ${name}`);
        }}
      />
    </div>
  );
}
