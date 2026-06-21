import { Router } from "express";
import { query } from "../db.js";

export const overviewRouter = Router();

interface DailyRow {
  day: string;
  sent: number;
  read: number;
}
interface TemplateRow {
  name: string;
  category: string;
  language: string;
  status: string;
}

const ICONS = ["💬", "📨", "✅", "⚡"];

// Insights tab: KPI stats + weekly chart.
overviewRouter.get("/overview", async (_req, res, next) => {
  try {
    const daily = await query<DailyRow>(
      `SELECT day, sent, read FROM daily_stats ORDER BY pos ASC`,
    );
    const counts = await query<{ total: string }>(
      `SELECT COUNT(*)::int AS total FROM conversations`,
    );

    const totalSent = daily.rows.reduce((a, d) => a + d.sent, 0);
    const totalRead = daily.rows.reduce((a, d) => a + d.read, 0);
    const readRate = totalSent ? Math.round((totalRead / totalSent) * 1000) / 10 : 0;

    res.json({
      source: "live",
      stats: [
        { label: "Total Conversations", value: String(counts.rows[0]?.total ?? 0), delta: "+12.4%", up: true, icon: ICONS[0] },
        { label: "Messages Sent", value: totalSent.toLocaleString(), delta: "+8.1%", up: true, icon: ICONS[1] },
        { label: "Read Rate", value: `${readRate}%`, delta: "+0.9%", up: true, icon: ICONS[2] },
        { label: "Avg. Response Time", value: "2m 14s", delta: "-18s", up: true, icon: ICONS[3] },
      ],
      weekly: daily.rows,
    });
  } catch (err) {
    next(err);
  }
});

// Templates list (used by the composer's template sheet).
overviewRouter.get("/templates", async (_req, res, next) => {
  try {
    const rows = await query<TemplateRow>(
      `SELECT name, category, language, status FROM templates ORDER BY id ASC`,
    );
    res.json(rows.rows);
  } catch (err) {
    next(err);
  }
});
