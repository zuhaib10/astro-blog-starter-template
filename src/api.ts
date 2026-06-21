import {
  demoConversations,
  demoStats,
  demoTemplates,
  demoThreads,
  demoWeekly,
} from "./data";
import type {
  ConversationSummary,
  DayPoint,
  Stat,
  Template,
  Thread,
  ThreadMessage,
} from "./types";

export interface DataSource {
  source: "live" | "demo";
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchConversations(): Promise<{
  conversations: ConversationSummary[];
  source: "live" | "demo";
}> {
  try {
    const data = await getJson<{ conversations: ConversationSummary[] }>(
      "/api/conversations",
    );
    return { conversations: data.conversations, source: "live" };
  } catch {
    return { conversations: demoConversations, source: "demo" };
  }
}

export async function fetchThread(id: number): Promise<Thread> {
  try {
    return await getJson<Thread>(`/api/conversations/${id}`);
  } catch {
    return (
      demoThreads[id] ?? {
        conversation: { id, name: "Conversation", phone: "", windowOpen: true, lastInboundAt: null },
        messages: [],
      }
    );
  }
}

export async function fetchTemplates(): Promise<Template[]> {
  try {
    return await getJson<Template[]>("/api/templates");
  } catch {
    return demoTemplates;
  }
}

export async function fetchInsights(): Promise<{ stats: Stat[]; weekly: DayPoint[] }> {
  try {
    return await getJson<{ stats: Stat[]; weekly: DayPoint[] }>("/api/overview");
  } catch {
    return { stats: demoStats, weekly: demoWeekly };
  }
}

export interface SendResult {
  ok: boolean;
  message?: ThreadMessage;
  error?: string;
}

export async function sendReply(
  id: number,
  payload: { text?: string; template?: string; language?: string },
): Promise<SendResult> {
  try {
    const res = await fetch(`/api/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return { ok: true, message: (await res.json()) as ThreadMessage };
    }
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: (err as { message?: string }).message ?? `HTTP ${res.status}` };
  } catch {
    // No backend — fabricate a local success so the demo UI stays usable.
    const body = payload.template ? `📋 ${payload.template}` : (payload.text ?? "");
    return {
      ok: true,
      message: {
        id: `local-${Date.now()}`,
        direction: "outbound",
        body,
        status: "sent",
        createdAt: new Date().toISOString(),
      },
    };
  }
}
