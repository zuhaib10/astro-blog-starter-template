// Wait-time label: "4m", "2h", "1d".
export function waitLabel(minutes: number | null): string {
  if (minutes == null) return "";
  if (minutes < 1) return "now";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

// Escalation level for the wait chip color.
export function waitLevel(minutes: number | null): "ok" | "warn" | "danger" {
  if (minutes == null) return "ok";
  if (minutes < 60) return "ok";
  if (minutes < 240) return "warn";
  return "danger";
}

// Clock time for a message bubble, e.g. "14:05".
export function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Minutes left in the 24h service window, or 0 if closed.
export function windowMinutesLeft(lastInboundAt: string | null): number {
  if (!lastInboundAt) return 0;
  const elapsedMin = (Date.now() - new Date(lastInboundAt).getTime()) / 60000;
  return Math.max(0, Math.round(24 * 60 - elapsedMin));
}

// Single source of truth for the 24h window state. Derive from the live
// timestamp so the banner and composer can never disagree; fall back to the
// server-provided flag only when no timestamp is available.
export function isWindowOpen(
  lastInboundAt: string | null,
  fallback = false,
): boolean {
  if (!lastInboundAt) return fallback;
  return windowMinutesLeft(lastInboundAt) > 0;
}

// "1h 12m" countdown label.
export function countdownLabel(minutesLeft: number): string {
  const h = Math.floor(minutesLeft / 60);
  const m = minutesLeft % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
