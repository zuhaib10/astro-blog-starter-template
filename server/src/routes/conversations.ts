import { Router } from "express";
import { query } from "../db.js";
import { sendTemplate, sendText } from "../whatsapp.js";
import { whatsappConfigured } from "../env.js";

export const conversationsRouter = Router();

const WINDOW_HOURS = 24;

interface ConvRow {
  id: number;
  name: string;
  phone: string;
  wa_id: string | null;
  unread: number;
  last_inbound_at: string | null;
  preview: string | null;
  wait_minutes: number | null;
}

function windowOpen(lastInboundAt: string | null): boolean {
  if (!lastInboundAt) return false;
  const ageMs = Date.now() - new Date(lastInboundAt).getTime();
  return ageMs < WINDOW_HOURS * 3600 * 1000;
}

// GET /api/conversations — inbox list, longest-waiting first.
conversationsRouter.get("/conversations", async (_req, res, next) => {
  try {
    const rows = await query<ConvRow>(
      `SELECT c.id, c.name, c.phone, c.wa_id, c.unread, c.last_inbound_at,
              (SELECT body FROM chat_messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC LIMIT 1) AS preview,
              EXTRACT(EPOCH FROM (now() - c.last_inbound_at)) / 60 AS wait_minutes
         FROM conversations c
        ORDER BY (c.unread > 0) DESC, c.last_inbound_at ASC`,
    );

    res.json({
      source: "live",
      conversations: rows.rows.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        unread: c.unread,
        preview: c.preview ?? "",
        waitMinutes: c.wait_minutes != null ? Math.round(c.wait_minutes) : null,
        windowOpen: windowOpen(c.last_inbound_at),
        lastInboundAt: c.last_inbound_at,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/conversations/:id — thread.
conversationsRouter.get("/conversations/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const conv = await query<ConvRow>(
      `SELECT id, name, phone, wa_id, unread, last_inbound_at FROM conversations WHERE id = $1`,
      [id],
    );
    if (conv.rowCount === 0) return res.status(404).json({ error: "Not found" });

    const msgs = await query(
      `SELECT id, direction, body, status, created_at AS "createdAt"
         FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id],
    );

    const c = conv.rows[0];
    res.json({
      conversation: {
        id: c.id,
        name: c.name,
        phone: c.phone,
        windowOpen: windowOpen(c.last_inbound_at),
        lastInboundAt: c.last_inbound_at,
      },
      messages: msgs.rows,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations/:id/messages — reply (text within window, else template).
conversationsRouter.post("/conversations/:id/messages", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { text, template, language } = req.body ?? {};

    const conv = await query<ConvRow>(
      `SELECT id, phone, wa_id, last_inbound_at FROM conversations WHERE id = $1`,
      [id],
    );
    if (conv.rowCount === 0) return res.status(404).json({ error: "Not found" });
    const c = conv.rows[0];
    const isOpen = windowOpen(c.last_inbound_at);

    // Enforce the 24-hour service window.
    if (!template) {
      if (!text) return res.status(400).json({ error: "Provide `text` or `template`." });
      if (!isOpen) {
        return res.status(409).json({
          error: "window_closed",
          message: "This chat is outside the 24-hour window. Send an approved template instead.",
        });
      }
    } else {
      const t = await query<{ status: string }>(
        `SELECT status FROM templates WHERE name = $1`,
        [template],
      );
      if (t.rowCount === 0) return res.status(404).json({ error: "Unknown template." });
      if (t.rows[0].status !== "Approved") {
        return res.status(409).json({ error: "template_not_approved", message: "Only approved templates can be sent." });
      }
    }

    const to = c.wa_id ?? c.phone.replace(/[^\d]/g, "");
    const body = template ? `Template sent: ${template}` : text;
    let waId: string | null = null;
    let status = "sent";

    // Send via the Cloud API when configured; otherwise simulate so the UI works on seed data.
    if (whatsappConfigured()) {
      const result = template
        ? await sendTemplate(to, template, language ?? "en")
        : await sendText(to, text);
      status = result.ok ? "sent" : "failed";
      const data = result.data as { messages?: Array<{ id?: string }> } | undefined;
      waId = data?.messages?.[0]?.id ?? null;
      if (!result.ok) {
        return res.status(502).json({ error: "send_failed", detail: result.data });
      }
    }

    const inserted = await query(
      `INSERT INTO chat_messages (conversation_id, wa_message_id, direction, body, status)
       VALUES ($1, $2, 'outbound', $3, $4)
       RETURNING id, direction, body, status, created_at AS "createdAt"`,
      [id, waId, body, status],
    );
    await query(`UPDATE conversations SET unread = 0 WHERE id = $1`, [id]);

    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    next(err);
  }
});
