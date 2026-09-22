"use client";

import { useEffect, useMemo, useState } from "react";

const starters = [
  "5 useful AI tools for students",
  "A beginner's guide to GitHub",
  "3 realistic online business ideas",
  "How to start building apps from a phone",
  "AI and music: useful tools for creators"
];

const templates = {
  post: (idea) => `HOOK: ${idea}

Here is the simple version:
• What it is
• Why it matters
• One practical way to start

CTA: Save this and follow Rapsometeddy for more.`,
  thread: (idea) => `THREAD IDEA: ${idea}

1/ Start with the problem.
2/ Explain the key idea in plain language.
3/ Give one practical example.
4/ Share one beginner-friendly next step.
5/ End with a simple takeaway.`,
  short: (idea) => `SHORT VIDEO: ${idea}

0–3s: Strong hook
3–10s: Explain the idea
10–20s: Give one useful example
20–25s: Call to action`
};

function makeId() { return Date.now() + Math.random(); }

export default function Home() {
  const [idea, setIdea] = useState("");
  const [format, setFormat] = useState("post");
  const [drafts, setDrafts] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rt-content-machine") || "[]");
      if (Array.isArray(saved)) setDrafts(saved);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("rt-content-machine", JSON.stringify(drafts));
  }, [drafts, hydrated]);

  const counts = useMemo(() => ({
    drafts: drafts.filter(d => d.status === "Draft").length,
    queued: drafts.filter(d => d.status === "Queued").length,
    published: drafts.filter(d => d.status === "Published").length
  }), [drafts]);

  function createDraft() {
    const text = idea.trim();
    if (!text) return;
    setDrafts(d => [{ id: makeId(), idea: text, content: templates[format](text), format, status: "Draft" }, ...d]);
    setIdea("");
  }

  function updateStatus(id, status) {
    setDrafts(d => d.map(x => x.id === id ? { ...x, status } : x));
  }

  function removeDraft(id) {
    setDrafts(d => d.filter(x => x.id !== id));
  }

  function clearAll() {
    if (confirm("Clear all local drafts?")) setDrafts([]);
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">RAPSOMETTEDY</p>
          <h1>Content Machine</h1>
          <p className="muted">Create, review and queue content from one mobile-friendly workspace.</p>
        </div>
        <span className="pill">V2</span>
      </header>

      <section className="card">
        <div className="section-head">
          <div><h2>Create content</h2><p className="muted">Turn one idea into a ready-to-edit content draft.</p></div>
        </div>
        <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="What should we create?" />
        <div className="formats">
          {Object.keys(templates).map(x => (
            <button key={x} className={format === x ? "format active" : "format"} onClick={() => setFormat(x)}>
              {x === "post" ? "Post" : x === "thread" ? "Thread" : "Short video"}
            </button>
          ))}
        </div>
        <button className="primary" onClick={createDraft}>Create draft</button>
        <div className="chips">{starters.map(x => <button className="chip" key={x} onClick={() => setIdea(x)}>{x}</button>)}</div>
      </section>

      <section className="grid">
        <div className="stat"><b>{counts.drafts}</b><span>Drafts</span></div>
        <div className="stat"><b>{counts.queued}</b><span>Queued</span></div>
        <div className="stat"><b>{counts.published}</b><span>Published</span></div>
      </section>

      <section className="card">
        <div className="section-head">
          <div><h2>Content queue</h2><p className="muted">Approve a draft, queue it, or remove it.</p></div>
          {drafts.length > 0 && <button className="ghost" onClick={clearAll}>Clear</button>}
        </div>

        {drafts.length === 0 ? <p className="muted">Your drafts will appear here.</p> :
          drafts.map(d => (
            <article className="draft" key={d.id}>
              <div className="draft-top">
                <div><b>{d.idea}</b><span className="tag">{d.format} · {d.status}</span></div>
                <button className="danger" onClick={() => removeDraft(d.id)}>×</button>
              </div>
              <pre>{d.content}</pre>
              <div className="actions">
                {d.status === "Draft" && <button onClick={() => updateStatus(d.id, "Approved")}>Approve</button>}
                {(d.status === "Approved" || d.status === "Draft") && <button onClick={() => updateStatus(d.id, "Queued")}>Queue</button>}
                {d.status === "Queued" && <button onClick={() => updateStatus(d.id, "Published")}>Mark published</button>}
              </div>
            </article>
          ))}
      </section>

      <section className="card roadmap">
        <p className="eyebrow">NEXT</p>
        <h2>Telegram + AI automation</h2>
        <p className="muted">The dashboard is ready for Telegram commands, real AI generation, scheduled publishing and platform analytics.</p>
        <div className="roadmap-grid">
          <span>✓ Mobile dashboard</span><span>✓ Draft workflow</span><span>✓ Queue workflow</span>
          <span>○ Telegram bot</span><span>○ AI API</span><span>○ Social publishing</span>
        </div>
      </section>
    </main>
  );
}
