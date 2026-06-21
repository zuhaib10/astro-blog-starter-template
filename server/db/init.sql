-- Schema + seed for the WhatsApp Business dashboard.
-- Auto-run by the postgres container on first start
-- (mounted into /docker-entrypoint-initdb.d).

CREATE TABLE IF NOT EXISTS daily_stats (
  pos  INT PRIMARY KEY,
  day  TEXT NOT NULL,
  sent INT  NOT NULL,
  read INT  NOT NULL
);

CREATE TABLE IF NOT EXISTS conversations (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  phone     TEXT NOT NULL,
  preview   TEXT NOT NULL,
  last_time TEXT NOT NULL,
  unread    INT  NOT NULL DEFAULT 0,
  status    TEXT NOT NULL DEFAULT 'sent'
);

CREATE TABLE IF NOT EXISTS templates (
  id       SERIAL PRIMARY KEY,
  name     TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  language TEXT NOT NULL,
  status   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  wa_message_id TEXT UNIQUE,
  from_number   TEXT,
  to_number     TEXT,
  body          TEXT,
  direction     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'sent',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Seed data (demo) ----
INSERT INTO daily_stats (pos, day, sent, read) VALUES
  (0, 'Mon', 980, 720),
  (1, 'Tue', 1240, 980),
  (2, 'Wed', 1100, 860),
  (3, 'Thu', 1430, 1180),
  (4, 'Fri', 1680, 1390),
  (5, 'Sat', 920, 640),
  (6, 'Sun', 580, 410)
ON CONFLICT (pos) DO NOTHING;

INSERT INTO conversations (name, phone, preview, last_time, unread, status) VALUES
  ('Aisha Khan',    '+92 300 1234567', 'Thanks! Order confirmed ✅',      '2m',  0, 'read'),
  ('Bilal Traders', '+92 321 9876543', 'Can you share the catalogue?',    '11m', 3, 'delivered'),
  ('Sara Malik',    '+92 333 4455667', 'Is COD available in Lahore?',     '34m', 1, 'delivered'),
  ('Hamza Store',   '+92 345 1122334', 'Invoice sent. Awaiting payment',  '1h',  0, 'sent'),
  ('Nida Fatima',   '+92 301 7788990', 'Great service, will order again!','3h',  0, 'read')
ON CONFLICT DO NOTHING;

INSERT INTO templates (name, category, language, status) VALUES
  ('order_confirmation', 'Utility',   'en', 'Approved'),
  ('shipping_update',    'Utility',   'en', 'Approved'),
  ('eid_promo_2026',     'Marketing', 'ur', 'Pending'),
  ('feedback_request',   'Utility',   'en', 'Approved'),
  ('cart_reminder',      'Marketing', 'en', 'Rejected')
ON CONFLICT (name) DO NOTHING;
