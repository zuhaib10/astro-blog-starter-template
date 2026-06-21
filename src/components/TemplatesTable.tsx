import { templates } from "../data";

export default function TemplatesTable() {
  return (
    <section className="panel" aria-label="Message templates">
      <div className="panel-head">
        <h2>Message templates</h2>
        <a className="link" href="#">
          Manage
        </a>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Category</th>
              <th scope="col">Language</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.name}>
                <td className="mono">{t.name}</td>
                <td>{t.category}</td>
                <td className="upper">{t.language}</td>
                <td>
                  <span className={`pill ${t.status.toLowerCase()}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
