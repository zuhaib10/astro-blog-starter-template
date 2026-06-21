import { useCallback, useEffect, useState } from "react";
import type { ConversationSummary, Template } from "../types";
import { fetchConversations, fetchTemplates } from "../api";
import Inbox from "./Inbox";
import Thread from "./Thread";

export default function ChatsView({
  onSource,
}: {
  onSource: (s: "live" | "demo") => void;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "demo">("demo");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"waiting" | "all">("waiting");

  const loadConversations = useCallback(() => {
    return fetchConversations().then(({ conversations, source }) => {
      setConversations(conversations);
      setSource(source);
      onSource(source);
    });
  }, [onSource]);

  useEffect(() => {
    Promise.all([loadConversations(), fetchTemplates().then(setTemplates)]).finally(
      () => setLoading(false),
    );
  }, [loadConversations]);

  return (
    <div className={`chats ${selectedId != null ? "has-selection" : ""}`}>
      <div className="chats-list">
        <Inbox
          conversations={conversations}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          filter={filter}
          onFilter={setFilter}
          source={source}
        />
      </div>
      <div className="chats-thread">
        {selectedId != null ? (
          <Thread
            key={selectedId}
            conversationId={selectedId}
            templates={templates}
            onBack={() => setSelectedId(null)}
            onSent={loadConversations}
          />
        ) : (
          <div className="thread-placeholder">
            <div className="empty-emoji" aria-hidden="true">💬</div>
            <p className="empty-title">Select a conversation</p>
            <p className="empty-sub">Pick a chat on the left to read and reply.</p>
          </div>
        )}
      </div>
    </div>
  );
}
