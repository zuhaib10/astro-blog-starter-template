import { useState } from "react";
import { navItems } from "../data";

export default function Sidebar() {
  const [active, setActive] = useState("Overview");

  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="brand">
        <span className="brand-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.16c-.25.69-1.45 1.32-1.99 1.36-.53.05-1.03.24-3.47-.72-2.92-1.15-4.78-4.13-4.93-4.32-.14-.2-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.25.61.84 2.03.91 2.18.07.14.12.31.02.5-.09.2-.14.31-.28.48-.14.17-.29.38-.42.5-.14.14-.28.29-.12.57.16.29.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.16-.2.69-.81.87-1.08.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.21.52.32.07.12.07.66-.18 1.35Z" />
          </svg>
        </span>
        <div className="brand-text">
          <strong>WA Business</strong>
          <small>Dashboard</small>
        </div>
      </div>

      <nav className="nav" aria-label="Sections">
        {navItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={item.label === active ? "active" : ""}
            aria-current={item.label === active ? "page" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setActive(item.label);
            }}
          >
            <span className="nav-ico" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="account">
        <div className="account-avatar" aria-hidden="true">
          B
        </div>
        <div className="account-text">
          <strong>Business Inc.</strong>
          <small className="online">Connected</small>
        </div>
      </div>
    </aside>
  );
}
