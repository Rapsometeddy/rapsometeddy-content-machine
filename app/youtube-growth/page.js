"use client";

import { useMemo, useState } from "react";
import "./youtube-growth.css";

const modules = [
  ["overview", "Overview", "⌂"], ["strategy", "Channel plan", "◎"], ["niche", "Niche finder", "⌕"],
  ["scripts", "Viral scripts", "✎"], ["production", "Production", "▶"], ["growth", "Growth lab", "↗"],
  ["money", "Monetization", "R"], ["analytics", "Analytics", "▥"], ["products", "Digital products", "◇"]
];

const niches = ["AI tools & tutorials", "Personal finance education", "Gaming guides", "Anime analysis", "Small-business growth", "Study skills", "Music production", "Tech explainers"];

function makeScript(topic, audience, format, tone) {
  const t = topic.trim() || "the topic you want to teach";
  const a = audience.trim() || "curious beginners";
  const short = format === "Short";
  return {
    title: short ? `Stop scrolling: ${t}` : `The beginner-friendly guide to ${t}`,
    hook: `If you're ${a.toLowerCase()} and ${t.toLowerCase()} still feels confusing, this is for you.`,
    outline: short
      ? [`0–3s · Hook: ${t} is easier to understand than you think.`, "3–15s · Give one useful tip or surprising fact.", "15–35s · Show a quick example or simple demonstration.", "35–50s · Share the key takeaway.", "50–60s · Ask viewers to save or comment."]
      : ["0:00 · Open with the problem and promise a clear result.", "0:30 · Explain who this is for and what viewers will learn.", "1:00 · Teach the first practical step with an example.", "3:00 · Demonstrate the next steps and common mistakes.", "6:00 · Summarise the process and give a realistic next action.", "End · Invite a specific question or subscription."],
    cta: "Comment with the part you want explained next.",
    tone
  };
}

function makePlan(channel, niche, goal) {
  const name = channel.trim() || "Your channel";
  const subject = niche.trim() || "your chosen topic";
  return `CHANNEL: ${name}\nNICHE: ${subject}\nPRIMARY GOAL: ${goal}\n\nPOSITIONING\nHelp a clearly defined audience solve one repeatable problem with useful, original videos.\n\nCONTENT PILLARS\n1. Beginner explainers — build trust and search discovery.\n2. Tutorials and demonstrations — deliver practical value.\n3. Comparisons and case studies — help viewers make decisions.\n\nWEEKLY STARTER CADENCE\n• 1 researched long-form video\n• 2–3 short clips derived from original ideas\n• 1 community question or poll\n\nFIRST 30 DAYS\nWeek 1: validate audience questions and publish one strong pilot.\nWeek 2: publish a follow-up answering real viewer questions.\nWeek 3: test a different hook and thumbnail concept.\nWeek 4: review retention, click-through rate and comments; repeat what worked.\n\nQUALITY RULE\nPrioritise accuracy, originality, clear audio and a useful viewer outcome. Never promise guaranteed views or income.`;
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function YouTubeGrowthOS() {
  const [active, setActive] = useState("overview");
  const [channel, setChannel] = useState("Rapsometeddy");
  const [niche, setNiche] = useState("AI, technology & entrepreneurship");
  const [goal, setGoal] = useState("Build a loyal audience");
  const [topic, setTopic] = useState("Free AI tools that save creators time");
  const [audience, setAudience] = useState("new creators using only a phone");
  const [format, setFormat] = useState("Short");
  const [tone, setTone] = useState("Clear and energetic");
  const [script, setScript] = useState(null);
  const [searchNiche, setSearchNiche] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("AI tools & tutorials");
  const [views, setViews] = useState("1200");
  const [impressions, setImpressions] = useState("18000");
  const [ctr, setCtr] = useState("4.2");
  const [retention, setRetention] = useState("38");
  const [notes, setNotes] = useState("");
  const [productAudience, setProductAudience] = useState("new YouTube creators");
  const [productProblem, setProductProblem] = useState("planning consistent videos");
  const [productType, setProductType] = useState("Creator starter kit");
  const [copied, setCopied] = useState(false);
  const plan = useMemo(() => makePlan(channel, niche, goal), [channel, niche, goal]);
  const filteredNiches = niches.filter(n => n.toLowerCase().includes(searchNiche.toLowerCase()));

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { downloadText("rapsometeddy-copy.txt", text); }
  }
  const scriptText = script ? `${script.title}\n\nHOOK\n${script.hook}\n\nOUTLINE\n${script.outline.join("\n")}\n\nCTA\n${script.cta}` : "";
  const impressionsNum = Math.max(0, Number(impressions) || 0);
  const ctrNum = Math.max(0, Number(ctr) || 0);
  const viewsNum = Math.max(0, Number(views) || 0);
  const retentionNum = Math.max(0, Math.min(100, Number(retention) || 0));
  const clickEstimate = Math.round(impressionsNum * ctrNum / 100);
  const analyticsAdvice = [
    ctrNum < 3 ? "Packaging test: try a clearer title and one strong thumbnail idea; compare results over a meaningful sample." : "Packaging: keep the promise specific and make sure the opening delivers what the title promises.",
    retentionNum < 30 ? "Opening: remove long introductions and show the outcome or strongest example earlier." : "Retention: identify the moment viewers stay engaged and use that structure again.",
    viewsNum > 0 && impressionsNum > 0 ? `Your supplied figures imply about ${clickEstimate.toLocaleString()} impression clicks. This is an estimate, not a YouTube Studio report.` : "Add your YouTube Studio figures to get more useful suggestions."
  ];
  const productOutline = `${productType.toUpperCase()}\nFor: ${productAudience}\nProblem: ${productProblem}\n\nDELIVERABLES\n1. Quick-start guide\n2. Fill-in planning worksheet\n3. Reusable checklist\n4. Worked example\n5. FAQ and next steps\n\nVALIDATION\nInterview 5 potential buyers, offer a free sample, collect feedback, then decide whether a paid version is worth making. Do not claim guaranteed channel growth.`;

  return <main className="yg-shell">
    <aside className="yg-sidebar">
      <a className="yg-brand" href="/"><span className="yg-crown">♛R</span><span>RAPSOMETTEDY<small>CREATOR SYSTEMS</small></span></a>
      <div className="yg-side-label">WORKSPACE</div>
      {modules.map(([id, label, icon]) => <button key={id} className={active === id ? "yg-nav active" : "yg-nav"} onClick={() => setActive(id)}><span>{icon}</span>{label}</button>)}
      <div className="yg-side-foot"><span className="yg-live-dot"/> FREE-FIRST WORKSPACE<br/><small>Drafts stay on this device until exported.</small></div>
    </aside>

    <section className="yg-main">
      <header className="yg-topbar"><div><span className="yg-breadcrumb">RAPSOMETTEDY LABS / </span><b>YOUTUBE GROWTH OS</b></div><a href="/" className="yg-back">← Content Machine</a></header>
      <div className="yg-content">
        {active === "overview" && <>
          <div className="yg-hero"><div><div className="yg-eyebrow">YOUR CREATOR COMMAND CENTRE</div><h1>Build with purpose.<br/><em>Grow with evidence.</em></h1><p>Plan your channel, create original videos, understand performance and package your knowledge into useful digital products.</p><div className="yg-hero-actions"><button className="yg-primary" onClick={() => setActive("strategy")}>Build my channel plan →</button><button className="yg-secondary" onClick={() => setActive("scripts")}>Create a script</button></div></div><div className="yg-orbit"><div className="yg-orbit-core">R</div><span>PLAN</span><span>CREATE</span><span>LEARN</span><span>EARN</span></div></div>
          <div className="yg-section-head"><div><div className="yg-eyebrow">THE WORKFLOW</div><h2>One workspace. Seven growth disciplines.</h2></div><span className="yg-tag">FREE-FIRST</span></div>
          <div className="yg-module-grid">{modules.slice(1,8).map(([id,label,icon],i)=><button key={id} className="yg-module-card" onClick={() => setActive(id)}><span className="yg-card-icon">{icon}</span><small>0{i+1}</small><b>{label}</b><p>{["Define your audience, promise and publishing rhythm.","Compare content directions and audience demand.","Turn an idea into a structured, original video.","Create a repeatable production checklist.","Improve discovery and audience experience.","Understand realistic revenue pathways.","Turn supplied metrics into practical experiments."][i]}</p><span className="yg-card-link">Open module ↗</span></button>)}</div>
          <div className="yg-callout"><div><b>Creator business builder</b><p>Use your channel as a real-world test case, then turn proven workflows into services and original downloadable products.</p></div><button className="yg-secondary" onClick={() => setActive("products")}>Build a product →</button></div>
        </>}

        {active === "strategy" && <Module title="Channel strategy planner" kicker="01 / FOUNDATION" desc="Set a clear promise, audience and sustainable publishing target. This creates a planning draft, not a prediction of channel growth.">
          <div className="yg-form-grid"><Field label="Channel name"><input value={channel} onChange={e=>setChannel(e.target.value)} /></Field><Field label="Niche / topic"><input value={niche} onChange={e=>setNiche(e.target.value)} /></Field><Field label="Main 90-day goal"><select value={goal} onChange={e=>setGoal(e.target.value)}><option>Build a loyal audience</option><option>Validate a niche</option><option>Generate service enquiries</option><option>Prepare a digital product</option></select></Field></div>
          <Output title="YOUR CHANNEL PLAN" text={plan} onCopy={copy} onDownload={()=>downloadText("rapsometeddy-channel-plan.txt",plan)}/>
        </Module>}

        {active === "niche" && <Module title="Niche finder" kicker="02 / RESEARCH" desc="Explore possible directions, then validate them with real audience questions and current platform signals. These are ideas, not live trend rankings.">
          <Field label="Filter niche ideas"><input value={searchNiche} onChange={e=>setSearchNiche(e.target.value)} placeholder="Search a topic..." /></Field><div className="yg-choice-grid">{filteredNiches.map(n=><button key={n} className={selectedNiche===n?"yg-choice selected":"yg-choice"} onClick={()=>setSelectedNiche(n)}>{n}<span>{selectedNiche===n?"✓":"＋"}</span></button>)}</div>
          <div className="yg-output"><div className="yg-output-head"><b>VALIDATION SCORECARD · {selectedNiche}</b></div><ol className="yg-checklist"><li>Audience pain: can you list 10 specific questions viewers ask?</li><li>Demand: check YouTube autocomplete, Google Trends and recent creator discussions.</li><li>Competition: find 10 channels and identify gaps you can serve better.</li><li>Repeatability: can you make 30 genuinely useful videos?</li><li>Revenue fit: are there relevant services or products without misleading viewers?</li></ol><button className="yg-primary" onClick={()=>{setNiche(selectedNiche);setActive("strategy")}}>Use this niche in my channel plan →</button></div>
        </Module>}

        {active === "scripts" && <Module title="Original script studio" kicker="03 / CONTENT CREATION" desc="Generate a practical first draft. Fact-check claims, add your own examples and never copy another creator's script.">
          <div className="yg-form-grid"><Field label="Video topic"><input value={topic} onChange={e=>setTopic(e.target.value)} /></Field><Field label="Who is it for?"><input value={audience} onChange={e=>setAudience(e.target.value)} /></Field><Field label="Video format"><select value={format} onChange={e=>setFormat(e.target.value)}><option>Short</option><option>Long-form</option></select></Field><Field label="Voice / tone"><select value={tone} onChange={e=>setTone(e.target.value)}><option>Clear and energetic</option><option>Calm and educational</option><option>Documentary and thoughtful</option><option>Funny but informative</option></select></Field></div>
          <button className="yg-primary" onClick={()=>setScript(makeScript(topic,audience,format,tone))}>Generate script outline →</button>
          {script && <div className="yg-output"><div className="yg-output-head"><b>{script.title}</b><button onClick={()=>copy(scriptText)}>Copy script</button></div><h4>HOOK</h4><p>{script.hook}</p><h4>VIDEO STRUCTURE</h4><ol>{script.outline.map(x=><li key={x}>{x}</li>)}</ol><h4>CALL TO ACTION</h4><p>{script.cta}</p><small>Draft only · add original footage, examples and fact checks.</small></div>}
        </Module>}

        {active === "production" && <Module title="Video production workflow" kicker="04 / PRODUCTION" desc="A repeatable, phone-friendly checklist. Tick items as you work; nothing is uploaded or published from this checklist.">
          <ProductionChecklist/>
        </Module>}

        {active === "growth" && <Module title="Growth lab" kicker="05 / DISCOVERY" desc="Use these experiments to improve the viewer experience. No tactic can guarantee views, subscribers or algorithmic reach.">
          <div className="yg-experiment-grid">{[["Title promise","Make the outcome clear. Remove vague words and avoid clickbait."],["Thumbnail clarity","Use one main idea, readable contrast and a visual that matches the video."],["First 30 seconds","Deliver the title's promise early. Cut unnecessary greetings and filler."],["Viewer satisfaction","Answer the question fully. Use chapters, examples and accurate descriptions."],["Series design","Make the next useful video obvious with a relevant playlist or end screen."],["Consistency","Choose a schedule you can sustain alongside school and other commitments."]].map(([t,d])=><div className="yg-experiment" key={t}><b>{t}</b><p>{d}</p></div>)}</div>
          <div className="yg-output"><b>Weekly learning loop</b><ol><li>Choose one video and one metric to improve.</li><li>Write down your hypothesis before changing anything.</li><li>Make one meaningful change at a time.</li><li>Review after enough data accumulates; record what you learned.</li></ol></div>
        </Module>}

        {active === "money" && <Module title="Monetization roadmap" kicker="06 / REVENUE" desc="Build trust and useful offers before expecting revenue. Eligibility, audience demand and platform rules always apply.">
          <div className="yg-revenue-list">{[["01","Services","Channel audits, content planning, script packages and creator workflow setup."],["02","Digital products","Original templates, planning kits, checklists and practical mini-guides."],["03","Affiliate partnerships","Only recommend relevant products you have assessed; clearly disclose paid links."],["04","YouTube Partner Program","Check current eligibility in YouTube Studio. Acceptance and earnings are not guaranteed."],["05","Sponsorships","Work only with suitable brands and clearly label sponsored content."]].map(([n,t,d])=><div className="yg-revenue-row" key={n}><strong>{n}</strong><div><b>{t}</b><p>{d}</p></div><span>Explore</span></div>)}</div>
          <div className="yg-note"><b>Important for creators under 18</b><p>AdSense for YouTube payments require an approved adult guardian's AdSense account where the creator is under 18. Never share account passwords or payment details in this workspace.</p></div>
        </Module>}

        {active === "analytics" && <Module title="Analytics intelligence" kicker="07 / MEASUREMENT" desc="Enter figures from YouTube Studio manually. This tool does not connect to YouTube or fetch live channel analytics.">
          <div className="yg-form-grid"><Field label="Views"><input type="number" min="0" value={views} onChange={e=>setViews(e.target.value)} /></Field><Field label="Impressions"><input type="number" min="0" value={impressions} onChange={e=>setImpressions(e.target.value)} /></Field><Field label="Impressions click-through rate (%)"><input type="number" min="0" max="100" step="0.1" value={ctr} onChange={e=>setCtr(e.target.value)} /></Field><Field label="Average percentage viewed (%)"><input type="number" min="0" max="100" value={retention} onChange={e=>setRetention(e.target.value)} /></Field></div>
          <div className="yg-metric-row"><Metric label="Views entered" value={viewsNum.toLocaleString()}/><Metric label="Estimated clicks" value={clickEstimate.toLocaleString()}/><Metric label="CTR entered" value={ctrNum+"%"}/><Metric label="Avg. viewed" value={retentionNum+"%"}/></div>
          <div className="yg-output"><b>Suggested experiments</b><ul>{analyticsAdvice.map(x=><li key={x}>{x}</li>)}</ul><Field label="Your observations / video title"><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What changed? Where did viewers drop off? What did comments say?" /></Field><button className="yg-secondary" onClick={()=>downloadText("rapsometeddy-analytics-notes.txt",`Views: ${views}\nImpressions: ${impressions}\nCTR: ${ctr}%\nAverage viewed: ${retention}%\n\n${analyticsAdvice.join("\n")}\n\nNotes: ${notes}`)}>Export analysis notes ↓</button></div>
        </Module>}

        {active === "products" && <Module title="Digital product builder" kicker="08 / SELLABLE ASSETS" desc="Create an original product outline based on a real creator problem. Validate demand before investing time or charging money.">
          <div className="yg-form-grid"><Field label="Product format"><select value={productType} onChange={e=>setProductType(e.target.value)}><option>Creator starter kit</option><option>30-day content planner</option><option>Thumbnail planning workbook</option><option>Channel audit template</option><option>Short-form script pack</option></select></Field><Field label="Who is it for?"><input value={productAudience} onChange={e=>setProductAudience(e.target.value)}/></Field><Field label="Problem it solves"><input value={productProblem} onChange={e=>setProductProblem(e.target.value)}/></Field></div>
          <Output title="PRODUCT BLUEPRINT" text={productOutline} onCopy={copy} onDownload={()=>downloadText("rapsometeddy-product-blueprint.txt",productOutline)}/>
          <div className="yg-note"><b>Simple validation before selling</b><p>Offer a genuinely useful free sample, ask potential users what is missing, and improve the product. Do not claim guaranteed views, subscribers or income.</p></div>
        </Module>}
        <footer className="yg-footer"><span>RAPSOMETTEDY LABS · YOUTUBE GROWTH OS</span><span>Draft workspace · Manual approval required for publishing</span></footer>
      </div>
    </section>
  </main>;
}

function Module({title,kicker,desc,children}) { return <><div className="yg-page-heading"><div className="yg-eyebrow">{kicker}</div><h1>{title}</h1><p>{desc}</p></div><div className="yg-panel">{children}</div></>; }
function Field({label,children}) { return <label className="yg-field"><span>{label}</span>{children}</label>; }
function Output({title,text,onCopy,onDownload}) { return <div className="yg-output"><div className="yg-output-head"><b>{title}</b><div><button onClick={()=>onCopy(text)}>Copy</button><button onClick={onDownload}>Download</button></div></div><pre>{text}</pre></div>; }
function Metric({label,value}) { return <div className="yg-metric"><small>{label}</small><b>{value}</b></div>; }
function ProductionChecklist() {
  const items=["Choose one viewer problem and define the video's promise","Research facts and save trustworthy source links","Write an original hook, outline and call to action","Record voice and footage in a quiet, well-lit place","Edit for clarity; remove dead time and check captions","Create a readable thumbnail that matches the video","Check title, description, rights and audience settings","Preview on a phone and verify audio before export","Save a backup and request approval before publishing"];
  const [done,setDone]=useState([]);
  return <><div className="yg-progress"><span>{done.length} / {items.length} complete</span><div><i style={{width:(done.length/items.length*100)+"%"}}/></div></div><div className="yg-tasks">{items.map((x,i)=><label key={x} className={done.includes(i)?"yg-task done":"yg-task"}><input type="checkbox" checked={done.includes(i)} onChange={()=>setDone(old=>old.includes(i)?old.filter(v=>v!==i):[...old,i])}/><span>{x}</span></label>)}</div><button className="yg-secondary" onClick={()=>setDone([])}>Reset checklist</button></>;
}
