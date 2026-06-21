# Wiring the WhatsApp Cloud API

This guide takes the dashboard from **demo data** to **live**: real inbound
messages, real delivery/read status, and the ability to send replies. This is
the "nothing is real until this works" gate.

## 0. What you need from Meta

Create a Meta app (Business type) and add the **WhatsApp** product:
<https://developers.facebook.com/apps>

From **WhatsApp → API Setup** collect:

| Value | Where it goes |
| --- | --- |
| **Temporary or permanent access token** | `WHATSAPP_TOKEN` |
| **Phone number ID** | `WHATSAPP_PHONE_NUMBER_ID` |
| A secret string you invent (the verify token) | `WHATSAPP_VERIFY_TOKEN` |

> Use a **System User** permanent token for anything beyond testing — the
> temporary token expires in 24 hours.

## 1. Configure environment

For Docker, set these in the root `.env` (copy from `.env.example`):

```bash
WHATSAPP_TOKEN=EAA...your-token...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=some-long-random-string
WHATSAPP_GRAPH_VERSION=v21.0
```

For local (no Docker), set the same in `server/.env`.

Restart so the API picks them up:

```bash
docker compose up -d --build api      # Docker
# or
cd server && npm run dev              # local
```

Confirm the API sees them:

```bash
curl -s http://localhost:4000/api/health
# { "ok": true, "whatsapp": "configured" }
```

## 2. Expose the webhook publicly

Meta must reach `POST /webhook` over HTTPS. In local/dev, tunnel it:

```bash
ngrok http 4000
# → https://<random>.ngrok-free.app  (this is your public base URL)
```

In production, point a real HTTPS domain at the `api` service (or put the `web`
nginx in front — it already proxies `/webhook` to the API).

## 3. Register the webhook in Meta

**WhatsApp → Configuration → Webhook → Edit:**

- **Callback URL:** `https://<your-public-host>/webhook`
- **Verify token:** the exact value of `WHATSAPP_VERIFY_TOKEN`
- Click **Verify and save** — Meta calls `GET /webhook`; our server echoes the
  challenge when the token matches.
- **Subscribe** to the `messages` field.

## 4. Verify end-to-end

Use the test script (see `scripts/test-whatsapp.sh`) or do it by hand:

```bash
# A) Webhook verification handshake (simulates Meta)
curl -s "http://localhost:4000/webhook?hub.mode=subscribe&hub.verify_token=$WHATSAPP_VERIFY_TOKEN&hub.challenge=PING"
# → PING

# B) Simulate an inbound customer message (no Meta needed)
curl -s -X POST http://localhost:4000/webhook \
  -H 'Content-Type: application/json' \
  -d '{"entry":[{"changes":[{"value":{"messages":[{"id":"wamid.TEST1","from":"923001234567","type":"text","text":{"body":"Hi from the test script"}}]}}]}]}'
# → 200 (row inserted into the messages table)

# C) Send a real reply (requires live creds; within the 24h window)
curl -s -X POST http://localhost:4000/api/conversations/2/messages \
  -H 'Content-Type: application/json' \
  -d '{"text":"Thanks for reaching out!"}'
```

Then send a WhatsApp message **from your phone to the business number** — it
should appear via the webhook, and your reply from step C should arrive on your
phone.

## 5. Things Meta will enforce (and so do we)

- **24-hour window:** free-text replies only within 24h of the customer's last
  message. Outside it, only **approved templates**. The API returns
  `409 window_closed` / `409 template_not_approved`; the UI mirrors this.
- **Templates** must be approved in **WhatsApp → Message Templates** before they
  can be sent. Pending/rejected templates are blocked.
- **Opt-in:** only message customers who opted in. No cold/bulk outreach.
- **Quality rating:** spammy sending throttles or bans the number.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| `health` shows `not-configured` | Token/phone-number-id not set or container not restarted |
| Webhook "verify" fails in Meta | `WHATSAPP_VERIFY_TOKEN` mismatch, or URL not HTTPS/public |
| Inbound messages don't appear | Not subscribed to the `messages` field, or tunnel down |
| Sends return `401/403` | Expired temporary token — switch to a System User token |
| Sends return `409` | Outside the 24h window — send an approved template instead |
