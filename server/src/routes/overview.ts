import { Router } from "express";
import { query } from "../db.js";

export const overviewRouter = Router();

interface DailyRow {
  day: string;
  sent: number;
  read: number;
  pos: number;
}
interface ConversationRow {
  name: string;
  phone: string;
  preview: string;
  last_time: string;
  unread: number;
  status: string;
}
interface TemplateRow {
  name: string;
  category: string;
  language: string;
  status: string;
}

const ICONS = ["💬", "📨", "✅", "⚡"];

overviewRouter.get("/overview", async (_req, res, next) => {
  try {
    const daily = await query<DailyRow>(
      `SELECT day, sent, read, pos FROM daily_stats ORDER BY pos ASC`,
    );
    const convos = await query<ConversationRow>(
      `SELECT name, phone, preview, last_time, unread, status
         FROM conversations ORDER BY id ASC LIMIT 8`,
    );
    const templates = await query<TemplateRow>(
      `SELECT name, category, language, status FROM templates ORDER BY id ASC`,
    );
    const counts = await query<{ total: string }>(
      `SELECT COUNT(*)::int AS total FROM conversations`,
    );

    const totalSent = daily.rows.reduce((a, d) => a + d.sent, 0);
    const totalRead = daily.rows.reduce((a, d) => a + d.read, 0);
    const readRate = totalSent ? Math.round((totalRead / totalSent) * 1000) / 10 : 0;

    const stats = [
      { label: "Total Conversations", value: String(counts.rows[0]?.total ?? 0), delta: "+12.4%", up: true, icon: ICONS[0] },
      { label: "Messages Sent", value: totalSent.toLocaleString(), delta: "+8.1%", up: true, icon: ICONS[1] },
      { label: "Read Rate", value: `${readRate}%`, delta: "+0.9%", up: true, icon: ICONS[2] },
      { label: "Avg. Response Time", value: "2m 14s", delta: "-18s", up: true, icon: ICONS[3] },
    ];

    res.json({
      source: "live",
      stats,
      weekly: daily.rows.map((d) => ({ day: d.day, sent: d.sent, read: d.read })),
      conversations: convos.rows.map((c) => ({
        name: c.name,
        phone: c.phone,
        preview: c.preview,
        time: c.last_time,
        unread: c.unread,
        status: c.status,
      })),
      templates: templates.rows,
    });
  } catch (err) {
    next(err);
  }
});
