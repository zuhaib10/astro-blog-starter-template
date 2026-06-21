import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";
import MessagesChart from "./components/MessagesChart";
import Conversations from "./components/Conversations";
import TemplatesTable from "./components/TemplatesTable";
import { useOverview } from "./useOverview";

export default function App() {
  const { stats, weekly, conversations, templates, source } = useOverview();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="layout">
        <Sidebar />
        <main className="main" id="main">
          <Topbar />

          <section className="cards" aria-label="Key metrics">
            {stats.map((s) => (
              <StatCard key={s.label} stat={s} />
            ))}
          </section>

          <div className="grid">
            <MessagesChart weekly={weekly} />
            <Conversations conversations={conversations} />
          </div>

          <TemplatesTable templates={templates} />

          <footer className="foot">
            {source === "live"
              ? "Live data from the API."
              : "Demo data. Start the backend (docker compose up) to show live metrics."}
          </footer>
        </main>
      </div>
    </>
  );
}
