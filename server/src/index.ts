import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { env, whatsappConfigured } from "./env.js";
import { waitForDb } from "./db.js";
import { overviewRouter } from "./routes/overview.js";
import { conversationsRouter } from "./routes/conversations.js";
import { webhookRouter } from "./routes/webhook.js";

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, whatsapp: whatsappConfigured() ? "configured" : "not-configured" });
});

app.use("/api", overviewRouter);
app.use("/api", conversationsRouter);
// Webhook lives at the root so the Meta callback URL is /webhook.
app.use("/", webhookRouter);

// Central error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Internal Server Error";
  console.error("[error]", message);
  res.status(500).json({ error: message });
});

async function start() {
  try {
    await waitForDb();
    console.log("[db] connected");
  } catch (err) {
    console.error("[db] could not connect, exiting:", err);
    process.exit(1);
  }
  app.listen(env.port, () => {
    console.log(`[api] listening on http://0.0.0.0:${env.port}`);
    console.log(`[api] WhatsApp Cloud API: ${whatsappConfigured() ? "configured" : "NOT configured (seed data only)"}`);
  });
}

start();
