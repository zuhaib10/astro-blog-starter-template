export type MessageStatus =
  | "sent"
  | "delivered"
  | "read"
  | "received"
  | "failed"
  | "sending";

export interface ConversationSummary {
  id: number;
  name: string;
  phone: string;
  unread: number;
  preview: string;
  waitMinutes: number | null;
  windowOpen: boolean;
  lastInboundAt: string | null;
}

export interface ThreadMessage {
  id: number | string;
  direction: "inbound" | "outbound";
  body: string;
  status: MessageStatus;
  createdAt: string;
}

export interface Thread {
  conversation: {
    id: number;
    name: string;
    phone: string;
    windowOpen: boolean;
    lastInboundAt: string | null;
  };
  messages: ThreadMessage[];
}

export type TemplateStatus = "Approved" | "Pending" | "Rejected";

export interface Template {
  name: string;
  category: string;
  language: string;
  status: TemplateStatus;
}

export interface Stat {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: string;
}

export interface DayPoint {
  day: string;
  sent: number;
  read: number;
}
