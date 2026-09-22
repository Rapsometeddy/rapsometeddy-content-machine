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
  const [market, setMarket] = useState(null);
  const [marketError, setMarketError] = useState("");
  const [paper, setPaper] = useState(() => ({
    cash: 10000, shares: 0, entry: 0, realized: 0, lastAction: "HOLD", lastSignal: "HOLD"
  }));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("rt-content-machine") || "[]");
      if (Array.isArray(saved)) setDrafts(saved);
      const savedPaper = JSON.parse(localStorage.getItem("rt-paper-aapl") || "null");
      if (savedPaper) setPaper(savedPaper);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("rt-content-machine", JSON.stringify(drafts));
      localStorage.setItem("rt-paper-aapl", JSON.stringify(paper));
    }
  }, [drafts, paper, hydrated]);

  async function refreshMarket() {
    try {
      setMarketError("");
      const r = await fetch("/api/market/AAPL", { cache: "no-store" });
      if (!r.ok) throw new Error("Market endpoint unavailable");
      setMarket(await r.json());
    } catch (e) {
      setMarketError(e.message || "Unable to load AAPL");
    }
  }

  useEffect(() => {
    refreshMarket();
    const timer = setInterval(refreshMarket, 30000);
    return () => clearInterval(timer);
  }, []);

  const signal = useMemo(() => {
    if (!market?.price) return "HOLD";
    if (typeof market.changePercent === "number") {
      if (market.changePercent >= 1) return "BUY";
      if (market.changePercent <= -1) return "SELL";
    }
    return "HOLD";
  }, [market]);

  useEffect(() => {
    if (!market?.price) return;
    setPaper(p => {
      let next = { ...p, lastSignal: signal };
      if (signal === "BUY" && p.shares === 0) {
        const shares = Math.floor(p.cash / market.price);
        if (shares > 0) {
          next.shares = shares;
          next.entry = market.price;
          next.cash = p.cash - shares * market.price;
          next.lastAction = "BUY";
        }
      } else if (signal === "SELL" && p.shares > 0) {
        const proceeds = p.shares * market.price;
        next.cash = p.cash + proceeds;
        next.realized = p.realized + (market.price - p.entry) * p.shares;
        next.shares = 0;
        next.entry = 0;
        next.lastAction = "SELL";
      }
      return next;
    });
  }, [market, signal]);

  const counts = useMemo(() => ({
    drafts: drafts.filter(d => d.status === "Draft").length,
    queued: drafts.filter(d => d.status === "Queued").length,
    published: drafts.filter(d => d.status === "Published").length
  }), [drafts]);

  const positionValue = market?.price ? paper.shares * market.price : 0;
  const unrealized = market?.price && paper.shares ? (market.price - paper.entry) * paper.shares : 0;
  const portfolio = paper.cash + positionValue;
  const totalPnL = portfolio - 10000;

  function createDraft() {
    const text = idea.trim();
    if (!text) return;
    setDrafts(d => [{ id: makeId(), idea: text, content: templates[format](text), format, status: "Draft" }, ...d]);
    setIdea("");
  }

  function updateStatus(id, status) { setDrafts(d => d.map(x => x.id === id ? { ...x, status } : x)); }
  function removeDraft(id) { setDrafts(d => d.filter(x => x.id !== id)); }
  function clearAll() { if (confirm("Clear all local drafts?")) setDrafts([]); }

  return (
    <main className="shell">
      <header>
        <div><p className="eyebrow">RAPSOMETTEDY</p><h1>Content Machine</h1><p className="muted">Create, review and queue content from one mobile-friendly workspace.</p></div>
        <span className="pill">V3</span>
      </header>

      <section className="card trading">
        <div className="section-head">
          <div><p className="eyebrow">PAPER TRADING</p><h2>AAPL Live Monitor</h2><p className="muted">Live market snapshot + simulated position. No real orders are sent.</p></div>
          <button className="ghost" onClick={refreshMarket}>Refresh</button>
        </div>
        {marketError ? <p className="error">{marketError}</p> : (
          <div className="market-grid">
            <div className="market-main"><span className="muted">AAPL</span><strong>{market?.price ? `$${market.price.toFixed(2)}` : "—"}</strong><span className={market?.changePercent >= 0 ? "up" : "down"}>{market?.changePercent != null ? `${market.changePercent >= 0 ? "+" : ""}${market.changePercent.toFixed(2)}%` : "Loading…"}</span></div>
            <div className="signal-box"><span>Signal</span><b className={signal.toLowerCase()}>{signal}</b></div>
            <div className="signal-box"><span>Position</span><b>{paper.shares ? `LONG · ${paper.shares}` : "FLAT"}</b></div>
          </div>
        )}
        <div className="portfolio-grid">
          <div><span>Cash</span><b>{`$${paper.cash.toFixed(2)}`}</b></div>
          <div><span>Position value</span><b>{`$${positionValue.toFixed(2)}`}</b></div>
          <div><span>Portfolio</span><b>{`$${portfolio.toFixed(2)}`}</b></div>
          <div><span>Unrealized P/L</span><b className={unrealized >= 0 ? "up" : "down"}>{`${unrealized >= 0 ? "+" : ""}$${unrealized.toFixed(2)}`}</b></div>
          <div><span>Realized P/L</span><b className={paper.realized >= 0 ? "up" : "down"}>{`${paper.realized >= 0 ? "+" : ""}$${paper.realized.toFixed(2)}`}</b></div>
          <div><span>Total P/L</span><b className={totalPnL >= 0 ? "up" : "down"}>{`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}</b></div>
        </div>
        <p className="muted tiny">Last action: {paper.lastAction} · Strategy signal: {paper.lastSignal} · Updates every 30 seconds.</p>
      </section>

      <section className="card">
        <div className="section-head"><div><h2>Create content</h2><p className="muted">Turn one idea into a ready-to-edit content draft.</p></div></div>
        <textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="What should we create?" />
        <div className="formats">{Object.keys(templates).map(x => <button key={x} className={format === x ? "format active" : "format"} onClick={() => setFormat(x)}>{x === "post" ? "Post" : x === "thread" ? "Thread" : "Short video"}</button>)}</div>
        <button className="primary" onClick={createDraft}>Create draft</button>
        <div className="chips">{starters.map(x => <button className="chip" key={x} onClick={() => setIdea(x)}>{x}</button>)}</div>
      </section>

      <section className="grid">
        <div className="stat"><b>{counts.drafts}</b><span>Drafts</span></div>
        <div className="stat"><b>{counts.queued}</b><span>Queued</span></div>
        <div className="stat"><b>{counts.published}</b><span>Published</span></div>
      </section>

      <section className="card">
        <div className="section-head"><div><h2>Content queue</h2><p className="muted">Approve a draft, queue it, or remove it.</p></div>{drafts.length > 0 && <button className="ghost" onClick={clearAll}>Clear</button>}</div>
        {drafts.length === 0 ? <p className="muted">Your drafts will appear here.</p> : drafts.map(d => (
          <article className="draft" key={d.id}>
            <div className="draft-top"><div><b>{d.idea}</b><span className="tag">{d.format} · {d.status}</span></div><button className="danger" onClick={() => removeDraft(d.id)}>×</button></div>
            <pre>{d.content}</pre>
            <div className="actions">{d.status === "Draft" && <button onClick={() => updateStatus(d.id, "Approved")}>Approve</button>}{(d.status === "Approved" || d.status === "Draft") && <button onClick={() => updateStatus(d.id, "Queued")}>Queue</button>}{d.status === "Queued" && <button onClick={() => updateStatus(d.id, "Published")}>Mark published</button>}</div>
          </article>
        ))}
      </section>

      <section className="card roadmap">
        <p className="eyebrow">NEXT</p><h2>Telegram + AI automation</h2><p className="muted">Dashboard, paper trading and content workflow are now together. Next: Telegram controls, real signal calculations and social publishing.</p>
        <div className="roadmap-grid"><span>✓ Mobile dashboard</span><span>✓ Draft workflow</span><span>✓ AAPL paper monitor</span><span>○ Telegram bot</span><span>○ Real indicators</span><span>○ Social publishing</span></div>
      </section>
    </main>
  );
}
