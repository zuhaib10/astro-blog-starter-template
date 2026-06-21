// Demo data used as a fallback when the backend is unreachable, so the
// inbox-first UI is fully explorable offline. Timestamps are relative to now.
import type {
  ConversationSummary,
  DayPoint,
  Stat,
  Template,
  Thread,
  ThreadMessage,
} from "./types";

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const demoConversations: ConversationSummary[] = [
  { id: 2, name: "Bilal Traders", phone: "+92 321 9876543", unread: 3, preview: "Can you share the catalogue?", waitMinutes: 11, windowOpen: true, lastInboundAt: minsAgo(11) },
  { id: 3, name: "Sara Malik", phone: "+92 333 4455667", unread: 1, preview: "Is COD available in Lahore?", waitMinutes: 34, windowOpen: true, lastInboundAt: minsAgo(34) },
  { id: 1, name: "Aisha Khan", phone: "+92 300 1234567", unread: 0, preview: "Thanks! Order confirmed ✅", waitMinutes: 2, windowOpen: true, lastInboundAt: minsAgo(2) },
  { id: 5, name: "Nida Fatima", phone: "+92 301 7788990", unread: 0, preview: "So glad to hear it! 🙏", waitMinutes: 190, windowOpen: true, lastInboundAt: minsAgo(190) },
  { id: 4, name: "Hamza Store", phone: "+92 345 1122334", unread: 0, preview: "Invoice sent. Awaiting payment.", waitMinutes: 1800, windowOpen: false, lastInboundAt: minsAgo(1800) },
];

export const demoThreads: Record<number, Thread> = {
  1: {
    conversation: { id: 1, name: "Aisha Khan", phone: "+92 300 1234567", windowOpen: true, lastInboundAt: minsAgo(2) },
    messages: [
      { id: 11, direction: "inbound", body: "Hi, is my order shipped?", status: "received", createdAt: minsAgo(8) },
      { id: 12, direction: "outbound", body: "Yes! Dispatched today, here is your tracking link.", status: "read", createdAt: minsAgo(5) },
      { id: 13, direction: "inbound", body: "Thanks! Order confirmed ✅", status: "received", createdAt: minsAgo(2) },
    ],
  },
  2: {
    conversation: { id: 2, name: "Bilal Traders", phone: "+92 321 9876543", windowOpen: true, lastInboundAt: minsAgo(11) },
    messages: [
      { id: 21, direction: "inbound", body: "Assalam o alaikum", status: "received", createdAt: minsAgo(13) },
      { id: 22, direction: "inbound", body: "Do you have wholesale rates?", status: "received", createdAt: minsAgo(12) },
      { id: 23, direction: "inbound", body: "Can you share the catalogue?", status: "received", createdAt: minsAgo(11) },
    ],
  },
  3: {
    conversation: { id: 3, name: "Sara Malik", phone: "+92 333 4455667", windowOpen: true, lastInboundAt: minsAgo(34) },
    messages: [
      { id: 31, direction: "outbound", body: "Hello! How can we help you today?", status: "read", createdAt: minsAgo(40) },
      { id: 32, direction: "inbound", body: "Is COD available in Lahore?", status: "received", createdAt: minsAgo(34) },
    ],
  },
  4: {
    conversation: { id: 4, name: "Hamza Store", phone: "+92 345 1122334", windowOpen: false, lastInboundAt: minsAgo(1800) },
    messages: [
      { id: 41, direction: "inbound", body: "Please send the invoice", status: "received", createdAt: minsAgo(1800) },
      { id: 42, direction: "outbound", body: "Invoice sent. Awaiting payment.", status: "delivered", createdAt: minsAgo(1740) },
    ],
  },
  5: {
    conversation: { id: 5, name: "Nida Fatima", phone: "+92 301 7788990", windowOpen: true, lastInboundAt: minsAgo(190) },
    messages: [
      { id: 51, direction: "inbound", body: "Received my parcel, thank you!", status: "received", createdAt: minsAgo(190) },
      { id: 52, direction: "outbound", body: "So glad to hear it! 🙏", status: "read", createdAt: minsAgo(180) },
    ],
  },
};

export const demoTemplates: Template[] = [
  { name: "order_confirmation", category: "Utility", language: "en", status: "Approved" },
  { name: "shipping_update", category: "Utility", language: "en", status: "Approved" },
  { name: "payment_reminder", category: "Utility", language: "en", status: "Approved" },
  { name: "eid_promo_2026", category: "Marketing", language: "ur", status: "Pending" },
  { name: "cart_reminder", category: "Marketing", language: "en", status: "Rejected" },
];

export const demoStats: Stat[] = [
  { label: "Total Conversations", value: "1,284", delta: "+12.4%", up: true, icon: "💬" },
  { label: "Messages Sent", value: "8,932", delta: "+8.1%", up: true, icon: "📨" },
  { label: "Read Rate", value: "78.1%", delta: "+0.9%", up: true, icon: "✅" },
  { label: "Avg. Response Time", value: "2m 14s", delta: "-18s", up: true, icon: "⚡" },
];

export const demoWeekly: DayPoint[] = [
  { day: "Mon", sent: 980, read: 720 },
  { day: "Tue", sent: 1240, read: 980 },
  { day: "Wed", sent: 1100, read: 860 },
  { day: "Thu", sent: 1430, read: 1180 },
  { day: "Fri", sent: 1680, read: 1390 },
  { day: "Sat", sent: 920, read: 640 },
  { day: "Sun", sent: 580, read: 410 },
];

// A locally fabricated outbound message (used when there is no backend).
export function localOutbound(body: string): ThreadMessage {
  return {
    id: `local-${Date.now()}`,
    direction: "outbound",
    body,
    status: "sent",
    createdAt: new Date().toISOString(),
  };
}
