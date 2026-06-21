import {
  stats as mockStats,
  weekly as mockWeekly,
  conversations as mockConversations,
  templates as mockTemplates,
  type Stat,
  type DayPoint,
  type Conversation,
  type Template,
} from "./data";

export interface Overview {
  source: "live" | "demo";
  stats: Stat[];
  weekly: DayPoint[];
  conversations: Conversation[];
  templates: Template[];
}

export const demoOverview: Overview = {
  source: "demo",
  stats: mockStats,
  weekly: mockWeekly,
  conversations: mockConversations,
  templates: mockTemplates,
};

/** Fetch the dashboard overview from the API; fall back to demo data if offline. */
export async function fetchOverview(signal?: AbortSignal): Promise<Overview> {
  try {
    const res = await fetch("/api/overview", { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as Overview;
    return { ...data, source: "live" };
  } catch {
    return demoOverview;
  }
}
