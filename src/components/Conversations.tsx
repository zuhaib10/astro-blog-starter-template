import { conversations, type MessageStatus } from "../data";

const tick = (s: MessageStatus) => (s === "sent" ? "✓" : "✓✓");

export default function Conversations() {
  return (
    <section className="panel" aria-label="Recent conversations">
      <div className="panel-head">
        <h2>Recent conversations</h2>
        <a className="link" href="#">
          View all
        </a>
      </div>
      <ul className="convos">
        {conversations.map((c) => (
          <li className="convo" key={c.phone}>
            <div className="convo-avatar" aria-hidden="true">
              {c.name.charAt(0)}
            </div>
            <div className="convo-body">
              <div className="convo-row">
                <strong>{c.name}</strong>
                <span className="convo-time">{c.time}</span>
              </div>
              <div className="convo-row">
                <span className="convo-preview">
                  <span className={`tick ${c.status}`} aria-hidden="true">
                    {tick(c.status)}
                  </span>
                  {c.preview}
                </span>
                {c.unread > 0 && (
                  <span className="badge" aria-label={`${c.unread} unread`}>
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
