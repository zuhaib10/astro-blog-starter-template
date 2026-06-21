import { useState } from "react";
import { weekly } from "../data";

const W = 560;
const H = 220;
const PAD_X = 8;
const PAD_TOP = 24;
const PAD_BOTTOM = 28;

export default function MessagesChart() {
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...weekly.map((d) => d.sent));
  const total = weekly.reduce((a, d) => a + d.sent, 0).toLocaleString();
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const plotW = W - PAD_X * 2;
  const groupW = plotW / weekly.length;
  const barW = 14;
  const gap = 6;

  const y = (v: number) => PAD_TOP + plotH - (v / max) * plotH;

  return (
    <section className="panel chart-panel" aria-label="Messages this week">
      <div className="panel-head">
        <div>
          <h2>Messages this week</h2>
          <p className="panel-sub">{total} messages sent · last 7 days</p>
        </div>
        <div className="legend">
          <span>
            <i className="dot sent" /> Sent
          </span>
          <span>
            <i className="dot read" /> Read
          </span>
        </div>
      </div>

      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Bar chart of messages sent and read per day. Peak ${max} on Friday.`}
      >
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const gy = PAD_TOP + plotH * t;
          return (
            <line
              key={t}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={gy}
              y2={gy}
              className="grid-line"
            />
          );
        })}

        {weekly.map((d, i) => {
          const cx = PAD_X + groupW * i + groupW / 2;
          const sentX = cx - barW - gap / 2;
          const readX = cx + gap / 2;
          const isHover = hover === i;
          return (
            <g
              key={d.day}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {/* hover hit area */}
              <rect
                x={PAD_X + groupW * i}
                y={PAD_TOP}
                width={groupW}
                height={plotH}
                fill="transparent"
              />
              <rect
                className="bar sent"
                x={sentX}
                y={y(d.sent)}
                width={barW}
                height={PAD_TOP + plotH - y(d.sent)}
                rx={5}
              />
              <rect
                className="bar read"
                x={readX}
                y={y(d.read)}
                width={barW}
                height={PAD_TOP + plotH - y(d.read)}
                rx={5}
              />
              {isHover && (
                <text className="bar-value" x={cx} y={y(d.sent) - 8} textAnchor="middle">
                  {d.sent}
                </text>
              )}
              <text className="bar-axis" x={cx} y={H - 8} textAnchor="middle">
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
