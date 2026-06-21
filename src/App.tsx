import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatCard from "./components/StatCard";
import MessagesChart from "./components/MessagesChart";
import Conversations from "./components/Conversations";
import TemplatesTable from "./components/TemplatesTable";
import { stats } from "./data";

export default function App() {
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
            <MessagesChart />
            <Conversations />
          </div>

          <TemplatesTable />

          <footer className="foot">
            Demo data. Connect the WhatsApp Cloud API to show live metrics.
          </footer>
        </main>
      </div>
    </>
  );
}
