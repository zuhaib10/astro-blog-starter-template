# Business WhatsApp Dashboard

A WhatsApp Business analytics dashboard — conversations, message delivery,
broadcasts and templates — built as a small full-stack app.

- **Frontend:** React + Vite + TypeScript (SPA, hand-rolled SVG charts, no chart lib)
- **Backend:** Node + Express + TypeScript (REST API, WhatsApp Cloud API client, webhook)
- **Database:** PostgreSQL
- **Orchestration:** Docker Compose (db + api + web)

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
| `GET`  | `/api/overview` | Stats, weekly chart, conversations, templates |
| `POST` | `/api/messages` | Send a message: `{ to, body }` or `{ to, template, language }` |
| `GET`  | `/webhook` | Meta verification handshake |
| `POST` | `/webhook` | Inbound messages + status callbacks |

If WhatsApp credentials are not set, `POST /api/messages` returns `503` and the
dashboard runs purely on seed/demo data.

## Project layout

```
.
├── docker-compose.yml      # db + api + web
├── Dockerfile              # frontend (build -> nginx, proxies /api & /webhook)
├── nginx.conf
├── src/                    # React frontend
│   ├── components/         # Sidebar, Topbar, StatCard, MessagesChart, ...
│   ├── api.ts              # fetch overview (falls back to demo data)
│   └── data.ts             # types + demo data
└── server/                 # Express backend
    ├── Dockerfile
    ├── db/init.sql         # schema + seed (auto-run by Postgres)
    └── src/
        ├── index.ts        # app bootstrap
        ├── db.ts           # pg pool + startup wait
        ├── whatsapp.ts     # Cloud API client
        └── routes/         # overview, messages, webhook
```
