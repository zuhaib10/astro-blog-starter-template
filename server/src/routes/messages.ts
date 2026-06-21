import { Router } from "express";
import { query } from "../db.js";
import { sendTemplate, sendText } from "../whatsapp.js";
import { whatsappConfigured } from "../env.js";

export const messagesRouter = Router();

/** POST /api/messages  { to, body }  or  { to, template, language } */
messagesRouter.post("/messages", async (req, res, next) => {
  try {
    const { to, body, template, language } = req.body ?? {};
    if (!to || (!body && !template)) {
      return res.status(400).json({ error: "Provide `to` and either `body` or `template`." });
    }
    if (!whatsappConfigured()) {
      return res.status(503).json({
        error:
          "WhatsApp Cloud API not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID to send live messages.",
      });
    }

    const result = template
      ? await sendTemplate(to, template, language ?? "en")
      : await sendText(to, body);

    await query(
      `INSERT INTO messages (wa_message_id, to_number, body, direction, status)
       VALUES ($1, $2, $3, 'outbound', $4)`,
      [
        extractMessageId(result.data),
        to,
        body ?? `template:${template}`,
        result.ok ? "sent" : "failed",
      ],
    );

    res.status(result.ok ? 200 : 502).json(result);
  } catch (err) {
    next(err);
  }
});

function extractMessageId(data: unknown): string | null {
  if (data && typeof data === "object" && "messages" in data) {
    const messages = (data as { messages?: Array<{ id?: string }> }).messages;
    return messages?.[0]?.id ?? null;
  }
  return null;
}
