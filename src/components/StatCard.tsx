import type { Stat } from "../data";

export default function StatCard({ stat }: { stat: Stat }) {
  return (
    <article className="card">
      <div className="card-top">
        <span className="card-ico" aria-hidden="true">
          {stat.icon}
        </span>
        <span className={`card-delta ${stat.up ? "up" : "down"}`}>
          {stat.up ? "▲" : "▼"} {stat.delta}
        </span>
      </div>
      <span className="card-value">{stat.value}</span>
      <span className="card-label">{stat.label}</span>
    </article>
  );
}
