import { useEffect, useState } from "react";
import type { Template } from "../types";
import { fetchTemplates } from "../api";

export default function Settings({ source }: { source: "live" | "demo" }) {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    fetchTemplates().then(setTemplates);
  }, []);

  return (
    <div className="settings">
      <header className="page-head">
        <h1>Settings</h1>
        <p>Connection, notifications and templates.</p>
      </header>

      <section className="panel">
        <h2>WhatsApp number</h2>
        <div className="setting-row">
          <span>Status</span>
          <span className={`conn ${source === "live" ? "live" : "demo"}`}>
            {source === "live" ? "Connected" : "Demo (no API)"}
          </span>
        </div>
        <div className="setting-row">
          <span>Cloud API</span>
          <span className="muted-val">
            {source === "live"
              ? "Webhook receiving messages"
              : "Set WHATSAPP_TOKEN to go live"}
          </span>
        </div>
      </section>

      <section className="panel">
        <h2>Notifications</h2>
        <label className="setting-row">
          <span>New message push</span>
          <input type="checkbox" defaultChecked />
        </label>
        <label className="setting-row">
          <span>Email fallback when app closed</span>
          <input type="checkbox" defaultChecked />
        </label>
        <label className="setting-row">
          <span>Sound</span>
          <input type="checkbox" />
        </label>
      </section>

      <section className="panel">
        <h2>Templates</h2>
        <p className="panel-sub">Approval status from Meta. Only approved templates can be sent.</p>
        <ul className="template-status-list">
          {templates.map((t) => (
            <li key={t.name}>
              <span className="mono">{t.name}</span>
              <span className={`pill ${t.status.toLowerCase()}`}>{t.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
