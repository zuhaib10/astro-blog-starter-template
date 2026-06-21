import { Router } from "express";
import { env } from "../env.js";
import { query } from "../db.js";

export const webhookRouter = Router();

/**
 * GET /webhook — Meta verification handshake.
 * Configure this URL + WHATSAPP_VERIFY_TOKEN in the Meta App dashboard.
 */
webhookRouter.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === env.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/**
 * POST /webhook — inbound messages and delivery/read status updates.
 * Always 200 quickly so Meta does not retry; persist what we recognise.
 */
webhookRouter.post("/webhook", async (req, res) => {
  res.sendStatus(200);
  try {
    const entries = req.body?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};

        for (const msg of value.messages ?? []) {
          await query(
            `INSERT INTO messages (wa_message_id, from_number, body, direction, status)
             VALUES ($1, $2, $3, 'inbound', 'received')
             ON CONFLICT (wa_message_id) DO NOTHING`,
            [msg.id ?? null, msg.from ?? null, msg.text?.body ?? `[${msg.type}]`],
          );
        }

        for (const status of value.statuses ?? []) {
          await query(
            `UPDATE messages SET status = $2 WHERE wa_message_id = $1`,
            [status.id ?? null, status.status ?? null],
          );
        }
      }
    }
  } catch (err) {
    console.error("[webhook] processing error:", err);
  }
});
