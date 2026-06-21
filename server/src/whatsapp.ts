import { env, whatsappConfigured } from "./env.js";

const base = () =>
  `https://graph.facebook.com/${env.whatsapp.graphVersion}/${env.whatsapp.phoneNumberId}/messages`;

interface SendResult {
  ok: boolean;
  status: number;
  data: unknown;
}

async function post(body: unknown): Promise<SendResult> {
  if (!whatsappConfigured()) {
    throw new Error(
      "WhatsApp Cloud API not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID.",
    );
  }
  const res = await fetch(base(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.whatsapp.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/** Send a plain text message to a WhatsApp number (E.164, no plus needed by API). */
export function sendText(to: string, body: string) {
  return post({
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { preview_url: false, body },
  });
}

/** Send a pre-approved template message. */
export function sendTemplate(to: string, name: string, language = "en") {
  return post({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: { name, language: { code: language } },
  });
}
