"use client";

import { useEffect, useMemo, useState } from "react";
import "./clip-factory.css";

const STORAGE_KEY = "rapsometeddy.clip-factory.v1";

function scoreMoment(text) {
  const signals = [
    [/\b(the truth is|here is why|the reason|what nobody|most people|secret)\b/i, 3],
    [/\b(never|always|mistake|lesson|learned|realized|important|remember)\b/i, 2],
    [/\b(money|business|success|failure|growth|AI|anime|gaming|strategy|career)\b/i, 1],
    [/[?!]/g, 1],
    [/\b(but|because|however|so|therefore)\b/i, 1]
  ];
  return signals.reduce((total, [pattern, points]) => total + (pattern.test(text) ? points : 0), 0) + Math.min(2, Math.floor(text.length / 180));
}

function makeHook(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  const firstSentence = clean.split(/[.!?]/)[0];
  return (firstSentence.length > 82 ? firstSentence.slice(0, 79).trimEnd() + "…" : firstSentence) || "A moment worth watching";
}

function parseTranscript(transcript) {
  const rows = transcript.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const found = [];
  for (const row of rows) {
    const match = row.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*[-–:]?\s+(.+)$/);
    if (!match) continue;
    const time = match[1];
    const text = match[2].trim();
    if (text.length < 35) continue;
    found.push({ time, text, score: scoreMoment(text) });
  }
  return found.sort((a, b) => b.score - a.score).slice(0, 12);
}

export default function ClipFactoryPage() {
  const [creator, setCreator] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState("Podcast / interview");
  const [transcript, setTranscript] = useState("");
  const [permission, setPermission] = useState(false);
  const [permissionNote, setPermissionNote] = useState("");
  const [queue, setQueue] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setQueue(JSON.parse(saved));
    } catch {
      setMessage("Saved queue could not be read on this device.");
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue)); }
    catch { setMessage("This device could not save the queue. Export your work as a backup."); }
  }, [queue]);

  const visible = useMemo(() => queue.filter(item => filter === "all" || item.status === filter), [queue, filter]);
  const pendingCount = queue.filter(item => item.status === "pending").length;
  const approvedCount = queue.filter(item => item.status === "approved").length;

  function generateCandidates() {
    setMessage("");
    let url;
    try { url = new URL(sourceUrl); } catch { setMessage("Enter a valid public video URL first."); return; }
    if (!["https:", "http:"].includes(url.protocol)) { setMessage("Only http/https source links are accepted."); return; }
    if (!creator.trim()) { setMessage("Add the creator or channel name."); return; }
    if (!permission || !permissionNote.trim()) { setMessage("Confirm permission and record who granted it or the licence that allows clipping."); return; }
    const moments = parseTranscript(transcript);
    if (!moments.length) { setMessage("No timestamped transcript lines found. Use one line per moment, e.g. [01:24] transcript text (at least 35 characters)."); return; }
    const batchId = Date.now().toString();
    const next = moments.map((moment, index) => ({
      id: batchId + "-" + index,
      creator: creator.trim(),
      sourceUrl: url.toString(),
      category,
      time: moment.time,
      transcript: moment.text,
      hook: makeHook(moment.text),
      score: moment.score,
      permissionNote: permissionNote.trim(),
      createdAt: new Date().toISOString(),
      status: "pending"
    }));
    setQueue(current => [...next, ...current]);
    setFilter("pending");
    setMessage(next.length + " clip ideas added to your approval queue. Nothing has been published.");
  }

  function updateStatus(id, status) {
    setQueue(current => current.map(item => item.id === id ? { ...item, status, reviewedAt: new Date().toISOString() } : item));
  }

  function exportQueue() {
    const data = JSON.stringify(queue, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rapsometeddy-clip-factory-queue.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="clip-shell">
      <nav className="clip-nav">
        <a href="/" className="clip-brand"><span className="clip-crown">♛</span> RAPSOMETTEDY <i>CLIP FACTORY</i></a>
        <a href="/" className="clip-back">Content Machine ↗</a>
      </nav>

      <header className="clip-hero">
        <p className="clip-eyebrow">RAPSOMETTEDY LABS · CREATOR WORKFLOW</p>
        <h1>One long video.<br /><span>More moments worth sharing.</span></h1>
        <p>Find promising moments in authorised podcasts, interviews, gaming streams and creator videos. Prepare short-form clip ideas, then review every one before it leaves the queue.</p>
        <div className="clip-pills"><span>PHONE-FIRST</span><span>FREE-FIRST</span><span>APPROVAL REQUIRED</span></div>
      </header>

      <section className="clip-stats">
        <article><small>IN APPROVAL QUEUE</small><strong>{pendingCount}</strong></article>
        <article><small>APPROVED BY YOU</small><strong>{approvedCount}</strong></article>
        <article><small>TOTAL CLIP IDEAS</small><strong>{queue.length}</strong></article>
      </section>

      <section className="clip-panel">
        <div className="clip-section-heading"><div><p className="clip-eyebrow">01 · SOURCE & RIGHTS</p><h2>Start with an authorised video</h2></div><span className="clip-step">INPUT</span></div>
        <div className="clip-form-grid">
          <label>Creator / channel name<input value={creator} onChange={e => setCreator(e.target.value)} placeholder="e.g. Creator name" /></label>
          <label>Original video URL<input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://…" inputMode="url" /></label>
          <label>Content category<select value={category} onChange={e => setCategory(e.target.value)}><option>Podcast / interview</option><option>Gaming / livestream</option><option>Business / education</option><option>Anime / entertainment commentary</option><option>Other creator content</option></select></label>
          <label>Permission record<input value={permissionNote} onChange={e => setPermissionNote(e.target.value)} placeholder="e.g. Written permission from creator, dated…" /></label>
        </div>
        <label className="clip-check"><input type="checkbox" checked={permission} onChange={e => setPermission(e.target.checked)} /><span>I have permission or a valid licence to edit and distribute this source, and I will follow the agreed terms.</span></label>
        <div className="clip-rights-note">Do not use a creator's video just because it is public. Keep the permission evidence and check whether the agreement covers monetisation and each platform.</div>
      </section>

      <section className="clip-panel">
        <div className="clip-section-heading"><div><p className="clip-eyebrow">02 · MOMENT FINDER</p><h2>Paste a timestamped transcript</h2></div><span className="clip-step">ANALYSE</span></div>
        <p className="clip-muted">For this first release, paste transcript lines from your permitted video. The built-in moment scorer works on-device and ranks possible hooks; it does not download videos or call a paid AI service.</p>
        <label>Transcript — one timestamp per line<textarea className="clip-transcript" value={transcript} onChange={e => setTranscript(e.target.value)} placeholder={"[00:42] The biggest mistake people make when starting a business is waiting until everything is perfect...\n[02:15] Here is why this simple strategy changed how I approach learning..."} /></label>
        <button className="clip-primary" onClick={generateCandidates}>Find clip moments <span>↗</span></button>
        {message && <p className="clip-message" role="status">{message}</p>}
        <p className="clip-footnote">Accepted timestamp formats: [MM:SS] or [HH:MM:SS]. Best moments are suggestions, not guaranteed viral clips.</p>
      </section>

      <section className="clip-panel clip-queue-panel">
        <div className="clip-section-heading"><div><p className="clip-eyebrow">03 · HUMAN REVIEW</p><h2>Your clip approval queue</h2></div><button className="clip-export" onClick={exportQueue} disabled={!queue.length}>Export backup ↓</button></div>
        <div className="clip-filters">{["pending", "approved", "rejected", "all"].map(value => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "all" ? "All" : value[0].toUpperCase() + value.slice(1)}</button>)}</div>
        {!visible.length ? <div className="clip-empty"><span>♛</span><b>No {filter === "all" ? "" : filter} clips yet</b><p>Authorised transcript moments will appear here for review.</p></div> : <div className="clip-cards">{visible.map(item => <article className="clip-card" key={item.id}>
          <div className="clip-card-top"><span className="clip-time">{item.time}</span><span className={"clip-status " + item.status}>{item.status}</span><span className="clip-score">Signal {item.score}/9</span></div>
          <h3>{item.hook}</h3><p>{item.transcript}</p>
          <div className="clip-source"><span>{item.creator} · {item.category}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">Original video ↗</a></div>
          <small className="clip-permission">Rights record: {item.permissionNote}</small>
          {item.status === "pending" ? <div className="clip-actions"><button onClick={() => updateStatus(item.id, "approved")}>Approve idea</button><button onClick={() => updateStatus(item.id, "rejected")}>Reject</button></div> : <div className="clip-actions"><button onClick={() => updateStatus(item.id, "pending")}>Return to pending</button></div>}
        </article>)}</div>}
        <p className="clip-safety">Approval here approves the clip idea only. It does not publish, schedule, download or grant rights to the source video.</p>
      </section>

      <footer className="clip-footer"><span>♛ RAPSOMETTEDY LABS</span><span>Local device queue · Export backups regularly · No auto-publishing</span></footer>
    </main>
  );
}
