import { useState } from "react";
import NavTabs, { type Tab } from "./components/NavTabs";
import ChatsView from "./components/ChatsView";
import Insights from "./components/Insights";
import Settings from "./components/Settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("chats");
  const [source, setSource] = useState<"live" | "demo">("demo");
  const [unread] = useState(4);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <NavTabs active={tab} onChange={setTab} unread={unread} />
      <main className="content" id="main">
        {tab === "chats" && <ChatsView onSource={setSource} />}
        {tab === "insights" && <Insights />}
        {tab === "settings" && <Settings source={source} />}
      </main>
    </div>
  );
}
