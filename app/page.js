"use client";

import { useState } from "react";

const examples = [
  { business: "Barber", idea: "Weekend haircut special", image: "BARBER SPECIAL", caption: "Fresh cut. Fresh week. Book your slot before the weekend rush." },
  { business: "Salon", idea: "New hairstyle promotion", image: "NEW STYLE", caption: "New look, new energy. Message us to book your next appointment." },
  { business: "Restaurant", idea: "Lunch special", image: "LUNCH SPECIAL", caption: "Good food, simple prices. Bring a friend and make lunch count." }
];

function makeContent(idea, business) {
  const name = business.trim() || "your business";
  const topic = idea.trim();
  if (!topic) return null;
  return {
    headline: topic.toUpperCase(),
    caption: `🔥 ${topic}

Built for ${name}.

Tell customers what you offer, why they should care, and what to do next.

CTA: Message us to book / order / enquire today.`,
    whatsapp: `Hi! 👋 We’re currently promoting: ${topic}.

If you’re interested, message us and we’ll help you get started.`
  };
}

export default function Home() {
  const [business, setBusiness] = useState("");
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);

  function generate() { setResult(makeContent(idea, business)); }

  return (
    <main className="site">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">R</span><span>RAPSOMETTEDY</span></div>
        <a className="nav-link" href="https://t.me/RapsometeddyHQBot" target="_blank" rel="noreferrer">Try on Telegram ↗</a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CONTENT MACHINE · BUILT FOR SMALL BUSINESS</p>
          <h1>Turn one business idea into a week of <span>ready-to-post content.</span></h1>
          <p className="hero-text">Give us your promotion, service or idea. Get practical social captions, WhatsApp copy and promotional image concepts — without spending hours figuring out what to post.</p>
          <div className="hero-actions"><a className="primary-link" href="#demo">Try the free demo</a><a className="secondary-link" href="#how">How it works</a></div>
          <p className="micro">No credit card · Free test · Telegram-first</p>
        </div>
        <div className="preview">
          <div className="preview-top"><span>CONTENT PREVIEW</span><span className="dot">● LIVE DEMO</span></div>
          <div className="promo-image"><span>WEEKEND<br/>SPECIAL</span><small>BOOK TODAY</small></div>
          <div className="preview-caption"><b>Caption</b><p>Fresh offer. Clear message. Simple call to action. Your next post starts here.</p></div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <div className="section-title"><p className="eyebrow">FREE DEMO</p><h2>Show us what you want to promote.</h2><p className="muted">Try the workflow with your own business. This demo does not require an account.</p></div>
        <div className="demo-grid">
          <div className="demo-form">
            <label>Business type<input value={business} onChange={e => setBusiness(e.target.value)} placeholder="e.g. Barber, salon, restaurant" /></label>
            <label>What are you promoting?<textarea value={idea} onChange={e => setIdea(e.target.value)} placeholder="e.g. R150 weekend haircut special" /></label>
            <button className="primary" onClick={generate}>Generate sample</button>
            <div className="chips">{["Weekend special", "New service", "Limited offer"].map(x => <button key={x} className="chip" onClick={() => setIdea(x)}>{x}</button>)}</div>
          </div>
          <div className="result-box">
            {!result ? <><span className="result-label">YOUR SAMPLE APPEARS HERE</span><div className="empty-result"><b>One idea → multiple ready-to-use pieces</b><p>Try the demo on the left.</p></div></> : <>
              <span className="result-label">{result.headline}</span>
              <div className="result-block"><b>Social caption</b><p>{result.caption}</p></div>
              <div className="result-block"><b>WhatsApp copy</b><p>{result.whatsapp}</p></div>
            </>}
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <div><p className="eyebrow">HOW IT WORKS</p><h2>Simple enough to use from your phone.</h2></div>
        <div className="steps">
          <div><strong>01</strong><b>Tell us your business</b><p>Give us your niche and what you sell.</p></div>
          <div><strong>02</strong><b>Give us one idea</b><p>A promotion, product, service or announcement.</p></div>
          <div><strong>03</strong><b>Get your content pack</b><p>Captions, WhatsApp copy and image-ready concepts.</p></div>
        </div>
      </section>

      <section className="examples">
        <div className="section-title"><p className="eyebrow">EXAMPLES</p><h2>Made for real-world businesses.</h2></div>
        <div className="example-grid">{examples.map(x => <article key={x.business} className="example"><div className="example-art"><span>{x.image}</span></div><p className="tag">{x.business}</p><h3>{x.idea}</h3><p>{x.caption}</p></article>)}</div>
      </section>

      <section className="cta">
        <p className="eyebrow">READY TO TEST IT?</p><h2>Get your first content sample free.</h2><p>We’re working with a small number of businesses while we improve the machine.</p><a className="primary-link" href="https://t.me/RapsometeddyHQBot" target="_blank" rel="noreferrer">Open the Telegram demo ↗</a>
      </section>

      <footer><span>© 2026 Rapsometeddy Content Machine</span><span>Built for creators & small businesses.</span></footer>
    </main>
  );
}
