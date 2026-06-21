# Business WhatsApp Dashboard

An **inbox-first** WhatsApp Business app for SMB owners: see who's waiting,
reply fast, and stay inside WhatsApp's rules. Built mobile-first as a small
full-stack app.

Product direction (COO + Designer brief): the home screen is the **conversation
inbox** (sorted longest-waiting-first), not a chart dashboard. KPIs live in a
secondary **Insights** tab. The composer **enforces the 24-hour service window**
— free text inside the window, approved templates only outside it.

- **Frontend:** React + Vite + TypeScript — bottom-tab IA (Chats / Insights /
  Settings), inbox + chat thread, 24h-window-aware composer, template bottom
  sheet, hand-rolled SVG chart (no chart lib). Falls back to demo data offline.
- **Backend:** Node + Express + TypeScript — REST API, WhatsApp Cloud API
  client, webhook (verification + inbound/status ingestion).
- **Database:** PostgreSQL (conversations, thread messages, templates, stats).
- **Orchestration:** Docker Compose (db + api + web).

## Quick start (Docker)

```bash
cp .env.example .env          # adjust ports / WhatsApp creds if you have them
docker compose up --build
```

Then open:

- **Dashboard:** http://localhost:8080
- **API health:** http://localhost:4000/api/health
- **Webhook URL (for Meta):** http://localhost:4000/webhook

The Postgres container seeds demo data on first start (`server/db/init.sql`),
so the dashboard shows live numbers immediately — no WhatsApp credentials
required to explore the UI.

## Local development (without Docker)

You need a local Postgres running (or just point `DATABASE_URL` at one).

```bash
# backend
cd server
cp .env.example .env
npm install
npm run dev          # http://localhost:4000

# frontend (separate terminal)
npm install
npm run dev          # http://localhost:5173  (proxies /api -> :4000)
```

## WhatsApp Cloud API integration

Set these (in `.env` for Docker, or `server/.env` for local) to send live messages:

| Variable | Description |
| --- | --- |
| `WHATSAPP_TOKEN` | Permanent/system-user access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone number ID from the Meta app |
| `WHATSAPP_VERIFY_TOKEN` | Any secret you also paste into the Meta webhook config |
| `WHATSAPP_GRAPH_VERSION` | Graph API version (default `v21.0`) |

**Webhook:** in the Meta App dashboard, set the callback URL to
`https://<your-host>/webhook` and the verify token to `WHATSAPP_VERIFY_TOKEN`.
`GET /webhook` handles the verification handshake; `POST /webhook` ingests
inbound messages and delivery/read status updates into the `messages` table.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `GET`  | `/api/health` | Liveness + whether WhatsApp is configured |
| `GET`  | `/api/conversations` | Inbox list, longest-waiting-first, with `windowOpen` + `waitMinutes` |
| `GET`  | `/api/conversations/:id` | One conversation's thread (messages + window state) |
| `POST` | `/api/conversations/:id/messages` | Reply: `{ text }` (within 24h window) or `{ template, language }` |
| `GET`  | `/api/templates` | Templates with approval status |
| `GET`  | `/api/overview` | Insights tab: KPI stats + weekly chart |
| `GET`  | `/webhook` | Meta verification handshake |
| `POST` | `/webhook` | Inbound messages + delivery/read status callbacks |

**Window enforcement (server-side):** `POST /api/conversations/:id/messages`
returns `409 window_closed` if you send free text outside the 24-hour window,
and `409 template_not_approved` if the template isn't approved — the UI enforces
the same rules, but the backend is the source of truth. When WhatsApp
credentials are not set, sends are simulated against seed data so the UI stays
fully usable.

## Project layout

```
.
├── docker-compose.yml      # db + api + web
├── Dockerfile              # frontend (build -> nginx, proxies /api & /webhook)
├── nginx.conf
├── src/                    # React frontend
│   ├── components/         # NavTabs, ChatsView, Inbox, ConversationRow,
│   │                       # Thread, Composer, TemplateSheet, Insights,
│   │                       # Settings, StatCard, MessagesChart
│   ├── api.ts              # data fetching (falls back to demo data offline)
│   ├── data.ts             # demo conversations / threads / templates
│   ├── format.ts           # wait-time + 24h-window helpers
│   └── types.ts            # shared types
└── server/                 # Express backend
    ├── Dockerfile
    ├── db/init.sql         # schema + seed (auto-run by Postgres)
    └── src/
        ├── index.ts        # app bootstrap
        ├── db.ts           # pg pool + startup wait
        ├── whatsapp.ts     # Cloud API client
        └── routes/         # overview, conversations, webhook
```
