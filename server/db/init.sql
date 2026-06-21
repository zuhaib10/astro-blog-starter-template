-- Schema + seed for the WhatsApp Business dashboard (inbox-first v1).
-- Auto-run by the postgres container on first start
-- (mounted into /docker-entrypoint-initdb.d).

-- ---- Insights (KPI tab) ----
CREATE TABLE IF NOT EXISTS daily_stats (
  pos  INT PRIMARY KEY,
  day  TEXT NOT NULL,
  sent INT  NOT NULL,
  read INT  NOT NULL
);

-- ---- Templates (used by the composer) ----
CREATE TABLE IF NOT EXISTS templates (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  status   TEXT NOT NULL
);

-- ---- Conversations + thread messages (the inbox) ----
CREATE TABLE IF NOT EXISTS conversations (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  wa_id           TEXT UNIQUE,
  unread          INT  NOT NULL DEFAULT 0,
  last_inbound_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  wa_message_id   TEXT UNIQUE,
  direction       TEXT NOT NULL,          -- 'inbound' | 'outbound'
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'sent', -- sent|delivered|read|received|failed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
  ON chat_messages (conversation_id, created_at);

-- ============ Seed data (demo) ============

INSERT INTO daily_stats (pos, day, sent, read) VALUES
  (0, 'Mon', 980, 720),
  (1, 'Tue', 1240, 980),
  (2, 'Wed', 1100, 860),
  (3, 'Thu', 1430, 1180),
  (4, 'Fri', 1680, 1390),
  (5, 'Sat', 920, 640),
  (6, 'Sun', 580, 410)
ON CONFLICT (pos) DO NOTHING;

INSERT INTO templates (name, category, language, status) VALUES
  ('order_confirmation', 'Utility',   'en', 'Approved'),
  ('shipping_update',    'Utility',   'en', 'Approved'),
  ('payment_reminder',   'Utility',   'en', 'Approved'),
  ('eid_promo_2026',     'Marketing', 'ur', 'Pending'),
  ('cart_reminder',      'Marketing', 'en', 'Rejected')
ON CONFLICT (name) DO NOTHING;

-- Conversations: last_inbound_at drives wait-time + the 24h window.
-- Most are recent (window OPEN); Hamza Store is >24h (window CLOSED).
INSERT INTO conversations (id, name, phone, wa_id, unread, last_inbound_at) VALUES
  (1, 'Aisha Khan',    '+92 300 1234567', '923001234567', 0, now() - interval '2 minutes'),
  (2, 'Bilal Traders', '+92 321 9876543', '923219876543', 3, now() - interval '11 minutes'),
  (3, 'Sara Malik',    '+92 333 4455667', '923334455667', 1, now() - interval '34 minutes'),
  (4, 'Hamza Store',   '+92 345 1122334', '923451122334', 0, now() - interval '30 hours'),
  (5, 'Nida Fatima',   '+92 301 7788990', '923017788990', 0, now() - interval '3 hours')
ON CONFLICT (id) DO NOTHING;
SELECT setval('conversations_id_seq', (SELECT MAX(id) FROM conversations));

INSERT INTO chat_messages (conversation_id, direction, body, status, created_at) VALUES
  -- Aisha: answered (no unread)
  (1, 'inbound',  'Hi, is my order shipped?',        'received',  now() - interval '8 minutes'),
  (1, 'outbound', 'Yes! Dispatched today, here is your tracking link.', 'read', now() - interval '5 minutes'),
  (1, 'inbound',  'Thanks! Order confirmed ✅',       'received',  now() - interval '2 minutes'),
  -- Bilal: 3 unread, waiting
  (2, 'inbound',  'Assalam o alaikum',               'received',  now() - interval '13 minutes'),
  (2, 'inbound',  'Do you have wholesale rates?',     'received',  now() - interval '12 minutes'),
  (2, 'inbound',  'Can you share the catalogue?',     'received',  now() - interval '11 minutes'),
  -- Sara: 1 unread, waiting
  (3, 'outbound', 'Hello! How can we help you today?','read',      now() - interval '40 minutes'),
  (3, 'inbound',  'Is COD available in Lahore?',      'received',  now() - interval '34 minutes'),
  -- Hamza: window closed (>24h), last we sent
  (4, 'inbound',  'Please send the invoice',          'received',  now() - interval '30 hours'),
  (4, 'outbound', 'Invoice sent. Awaiting payment.',  'delivered', now() - interval '29 hours'),
  -- Nida: answered
  (5, 'inbound',  'Received my parcel, thank you!',   'received',  now() - interval '3 hours 10 minutes'),
  (5, 'outbound', 'So glad to hear it! 🙏',           'read',      now() - interval '3 hours');
