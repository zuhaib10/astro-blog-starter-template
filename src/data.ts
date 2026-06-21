// Mock data layer. Swap these for the WhatsApp Cloud API later — keep the
// shapes and the UI components stay unchanged.

export type MessageStatus = "sent" | "delivered" | "read";

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

export interface Conversation {
  name: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  status: MessageStatus;
}

export type TemplateStatus = "Approved" | "Pending" | "Rejected";

export interface Template {
  name: string;
  category: "Utility" | "Marketing" | "Authentication";
  language: string;
  status: TemplateStatus;
}

export interface NavItem {
  icon: string;
  label: string;
}

export const stats: Stat[] = [
  { label: "Total Conversations", value: "1,284", delta: "+12.4%", up: true, icon: "💬" },
  { label: "Messages Sent", value: "8,932", delta: "+8.1%", up: true, icon: "📨" },
  { label: "Delivery Rate", value: "97.6%", delta: "+0.9%", up: true, icon: "✅" },
  { label: "Avg. Response Time", value: "2m 14s", delta: "-18s", up: true, icon: "⚡" },
];

export const weekly: DayPoint[] = [
  { day: "Mon", sent: 980, read: 720 },
  { day: "Tue", sent: 1240, read: 980 },
  { day: "Wed", sent: 1100, read: 860 },
  { day: "Thu", sent: 1430, read: 1180 },
  { day: "Fri", sent: 1680, read: 1390 },
  { day: "Sat", sent: 920, read: 640 },
  { day: "Sun", sent: 580, read: 410 },
];

export const conversations: Conversation[] = [
  { name: "Aisha Khan", phone: "+92 300 1234567", preview: "Thanks! Order confirmed ✅", time: "2m", unread: 0, status: "read" },
  { name: "Bilal Traders", phone: "+92 321 9876543", preview: "Can you share the catalogue?", time: "11m", unread: 3, status: "delivered" },
  { name: "Sara Malik", phone: "+92 333 4455667", preview: "Is COD available in Lahore?", time: "34m", unread: 1, status: "delivered" },
  { name: "Hamza Store", phone: "+92 345 1122334", preview: "Invoice sent. Awaiting payment", time: "1h", unread: 0, status: "sent" },
  { name: "Nida Fatima", phone: "+92 301 7788990", preview: "Great service, will order again!", time: "3h", unread: 0, status: "read" },
];

export const templates: Template[] = [
  { name: "order_confirmation", category: "Utility", language: "en", status: "Approved" },
  { name: "shipping_update", category: "Utility", language: "en", status: "Approved" },
  { name: "eid_promo_2026", category: "Marketing", language: "ur", status: "Pending" },
  { name: "feedback_request", category: "Utility", language: "en", status: "Approved" },
  { name: "cart_reminder", category: "Marketing", language: "en", status: "Rejected" },
];

export const navItems: NavItem[] = [
  { icon: "📊", label: "Overview" },
  { icon: "💬", label: "Conversations" },
  { icon: "📨", label: "Broadcasts" },
  { icon: "🧩", label: "Templates" },
  { icon: "👥", label: "Contacts" },
  { icon: "⚙️", label: "Settings" },
];
