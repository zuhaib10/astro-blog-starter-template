export default function Topbar() {
  return (
    <header className="topbar">
      <div>
        <h1>Overview</h1>
        <p>Here's what's happening with your WhatsApp Business account today.</p>
      </div>
      <div className="topbar-actions">
        <label className="search">
          <span className="search-ico" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            placeholder="Search conversations…"
            aria-label="Search conversations"
          />
        </label>
        <button className="btn" type="button">
          <span aria-hidden="true">＋</span> New broadcast
        </button>
      </div>
    </header>
  );
}
