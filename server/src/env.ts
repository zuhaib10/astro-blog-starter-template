import "dotenv/config";

function int(name: string, fallback: number): number {
  const raw = process.env[name];
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  port: int("PORT", 4000),
  // Postgres connection. DATABASE_URL wins; otherwise discrete PG* vars.
  databaseUrl:
    process.env.DATABASE_URL ??
    `postgres://${process.env.PGUSER ?? "postgres"}:${
      process.env.PGPASSWORD ?? "postgres"
    }@${process.env.PGHOST ?? "localhost"}:${process.env.PGPORT ?? "5432"}/${
      process.env.PGDATABASE ?? "whatsapp"
    }`,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",

  // WhatsApp Cloud API. Leave unset to run the dashboard against seed data only.
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "changeme",
    graphVersion: process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0",
  },
};

export const whatsappConfigured = () =>
  Boolean(env.whatsapp.token && env.whatsapp.phoneNumberId);
