import { useEffect, useState } from "react";
import type { DayPoint, Stat } from "../types";
import { fetchInsights } from "../api";
import StatCard from "./StatCard";
import MessagesChart from "./MessagesChart";

export default function Insights() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [weekly, setWeekly] = useState<DayPoint[]>([]);

  useEffect(() => {
    fetchInsights().then(({ stats, weekly }) => {
      setStats(stats);
      setWeekly(weekly);
    });
  }, []);

  return (
    <div className="insights">
      <header className="page-head">
        <h1>Insights</h1>
        <p>Weekly health of your WhatsApp channel.</p>
      </header>

      <section className="cards" aria-label="Key metrics">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </section>

      {weekly.length > 0 && <MessagesChart weekly={weekly} />}
    </div>
  );
}
