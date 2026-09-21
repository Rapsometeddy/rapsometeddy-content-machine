"use client";

import { useState } from "react";

const starters = [
  "5 useful AI tools for students",
  "A beginner's guide to GitHub",
  "3 realistic online business ideas"
];

export default function Home() {
  const [idea,setIdea]=useState("");
  const [drafts,setDrafts]=useState([]);

  function createDraft() {
    if (!idea.trim()) return;
    setDrafts([{id:Date.now(),idea:idea.trim(),status:"Draft"},...drafts]);
    setIdea("");
  }

  return (
    <main className="shell">
      <header>
        <div>
          <p className="eyebrow">RAPSOMETTEDY</p>
          <h1>Content Machine</h1>
          <p className="muted">Create, review and queue content from one mobile-friendly workspace.</p>
        </div>
        <span className="pill">V1</span>
      </header>

      <section className="card">
        <h2>Create content</h2>
        <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="What should we create?"/>
        <button onClick={createDraft}>Create draft</button>
        <div className="chips">
          {starters.map(x=><button className="chip" key={x} onClick={()=>setIdea(x)}>{x}</button>)}
        </div>
      </section>

      <section className="grid">
        <div className="stat"><b>{drafts.length}</b><span>Drafts</span></div>
        <div className="stat"><b>0</b><span>Queued</span></div>
        <div className="stat"><b>0</b><span>Published</span></div>
      </section>

      <section className="card">
        <h2>Content queue</h2>
        {drafts.length===0 ? <p className="muted">Your drafts will appear here.</p> :
          drafts.map(d=><div className="draft" key={d.id}><div><b>{d.idea}</b><span>{d.status}</span></div><button onClick={()=>setDrafts(drafts.map(x=>x.id===d.id?{...x,status:"Approved"}:x))}>Approve</button></div>)}
      </section>
    </main>
  );
}
