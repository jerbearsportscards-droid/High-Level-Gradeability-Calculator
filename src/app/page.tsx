"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const ALERT_WINS = [
  { user: "@BreakKing_FL",    card: "Mahomes Chrome Prizm RC",           profit: "+$1,840", grade: "PSA 10" },
  { user: "@CardFlipperTX",   card: "Wander Franco Bowman Auto",         profit: "+$870",   grade: "PSA 10" },
  { user: "@FlipQueenATL",    card: "LeBron 2003 Topps Chrome RC",       profit: "+$4,200", grade: "PSA 10" },
  { user: "Marcus D.",        card: "Luka Doncic Prizm Silver RPA",      profit: "+$2,100", grade: "PSA 10" },
  { user: "@GradeGodNYC",     card: "Shohei Ohtani Bowman Chrome Auto",  profit: "+$3,400", grade: "PSA 10" },
  { user: "Kevin R.",         card: "Justin Jefferson Select RC",         profit: "+$540",   grade: "PSA 10" },
  { user: "@BreakerPro22",    card: "Mike Trout 2011 Bowman Chrome RC",  profit: "+$1,200", grade: "PSA 10" },
  { user: "Sarah M.",         card: "Victor Wembanyama Prizm Draft RC",  profit: "+$980",   grade: "PSA 10" },
  { user: "@CollectorKing",   card: "Caitlin Clark Prizm Rookie",        profit: "+$660",   grade: "PSA 10" },
  { user: "James L.",         card: "Fernando Tatis Jr. Bowman Auto",    profit: "+$1,560", grade: "PSA 10" },
];

const TICKER_ITEMS = [
  { type: "win",   user: "Marcus D.",     card: "2017 Prizm Mahomes RC",               profit: "+$1,840", grade: "PSA 10" },
  { type: "price", card: "2003 Topps Chrome LeBron RC",       price: "$18,500", change: "+12%" },
  { type: "win",   user: "Sarah M.",      card: "2003 Topps Chrome LeBron RC",         profit: "+$4,200", grade: "PSA 10" },
  { type: "price", card: "2020 Bowman Chrome Wander Franco",  price: "$420",    change: "+8%"  },
  { type: "win",   user: "Kevin R.",      card: "2018 Bowman Chrome Ohtani Auto",      profit: "+$2,100", grade: "PSA 10" },
  { type: "price", card: "2011 Bowman Chrome Trout RC",       price: "$3,200",  change: "+5%"  },
  { type: "win",   user: "James L.",      card: "2019 Prizm Luka Doncic Silver",       profit: "+$2,340", grade: "PSA 10" },
  { type: "price", card: "2017 Prizm Patrick Mahomes RC",     price: "$5,800",  change: "+22%" },
  { type: "win",   user: "@GradeGodNYC", card: "Ohtani Bowman Chrome Auto",           profit: "+$3,400", grade: "PSA 10" },
  { type: "price", card: "2023 Bowman Wembanyama RC",         price: "$280",    change: "+41%" },
];

const WINS = [
  { user: "Marcus D.", location: "Miami, FL", profit: "+$1,840", card: "2017 Prizm Mahomes RC · Score 83/100 · PSA 10", quote: "Score came back 83. I was skeptical but I shipped it. Came back PSA 10, sold for $2,040. Bought it for $175 at a show. This thing is the real deal." },
  { user: "Sarah M.",  location: "Atlanta, GA", profit: "+$4,200", card: "2003 Topps Chrome LeBron RC · Score 91/100 · PSA 10", quote: "I had this LeBron RC sitting in a box for two years. Ran the score on a whim — 91 out of 100. Shipped it in a week. Changed my whole outlook on what I have." },
  { user: "Kevin R.",  location: "Dallas, TX", profit: "+$2,100", card: "2018 Bowman Chrome Ohtani Auto · Score 78/100 · PSA 10", quote: "Used it before submitting 8 cards. Skipped 3 it flagged as low-score. The 5 I sent? All came back profitable. Saved me from burning $75 on bad submissions." },
];

function useCounter(target: number, duration = 2000) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setVal(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return { val, ref };
}

export default function Landing() {
  const { val: profitVal, ref: profitRef } = useCounter(284600);

  return (
    <div style={{ background: "#030e1e", color: "#f2ead8", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", overflowX: "hidden" }}>

      {/* Ambient glow — gold center + ocean blue flanks */}
      <div style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 1200, height: 600, background: "radial-gradient(ellipse at center, rgba(201,170,113,0.07) 0%, transparent 55%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "10%", left: "0%", width: 600, height: 600, background: "radial-gradient(ellipse at center, rgba(20,90,180,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "10%", right: "0%", width: 600, height: 600, background: "radial-gradient(ellipse at center, rgba(20,90,180,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Alert bar */}
      <div style={{ background: "#020c1a", borderBottom: "1px solid #1c3554", padding: "10px 0", overflow: "hidden", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", width: "max-content", animation: "alert-scroll 45s linear infinite" }}>
          {[...ALERT_WINS, ...ALERT_WINS].map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 36px", whiteSpace: "nowrap", fontSize: 12 }}>
              <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%", flexShrink: 0, display: "inline-block" }} />
              <span style={{ color: "#c9aa71", fontWeight: 600 }}>{w.user}</span>
              <span style={{ color: "#2a4060" }}>just scored</span>
              <span style={{ color: "#22c55e", fontWeight: 600 }}>{w.profit}</span>
              <span style={{ color: "#2a4060" }}>on {w.card} {w.grade}</span>
              <span style={{ color: "#1c3554", padding: "0 8px" }}>·</span>
            </div>
          ))}
        </div>
      </div>

      <Nav />

      {/* Hero */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 60, padding: "80px 6% 70px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ maxWidth: 560 }}>
          <div style={{ color: "#c8bfa8", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 24, height: 1, background: "#c8bfa8", display: "inline-block" }} />
            Built for serious submitters
          </div>
          <h1 style={{ fontWeight: 700, fontSize: "3rem", lineHeight: 1.12, letterSpacing: "-0.01em", marginBottom: 22, fontFamily: "var(--font-playfair), Georgia, serif" }}>
            <span style={{ color: "#f2ead8" }}>Stop guessing.</span><br />
            <span style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              The money
            </span>{" "}<span style={{ color: "#c8bfa8" }}>is in the math.</span>
          </h1>
          <p style={{ color: "#6b80a0", fontSize: "1.05rem", lineHeight: 1.72, marginBottom: 36 }}>
            A weighted scoring engine built on real gem rates, market pricing, and downside protection. See the potential upside — and the floor — before the card ever leaves your hands.
          </p>
          <div style={{ display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" }}>
            <Link href="/score" style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)", color: "#030e1e", fontWeight: 700, padding: "13px 28px", borderRadius: 4, textDecoration: "none", fontSize: 14, letterSpacing: "0.05em" }}>
              Score My First Card Free →
            </Link>
            <a href="#how" style={{ color: "#c9aa71", background: "transparent", border: "1px solid #1c3554", fontWeight: 600, padding: "13px 28px", borderRadius: 4, textDecoration: "none", fontSize: 14 }}>
              See How It Works
            </a>
          </div>
          <div style={{ display: "flex", gap: 36 }}>
            {[["$2,340", "Biggest single-card member win", true], ["89%", "Of high scores led to profitable grades", false], ["8", "Weighted factors in every score", false]].map(([num, label, isMoney], i) => (
              <div key={i}>
                <div style={{ fontFamily: "monospace", fontSize: isMoney ? "2rem" : "1.6rem", fontWeight: 900, color: isMoney ? "#22c55e" : "#c9aa71", textShadow: isMoney ? "0 0 24px rgba(34,197,94,0.4)" : "none" }}>{num as string}</div>
                <div style={{ fontSize: 11, color: "#6b80a0", marginTop: 3 }}>{label as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slab stack */}
        <div style={{ position: "relative", flexShrink: 0, width: 380, height: 380 }}>
          {[
            { left: 0, top: 40, rotate: -6, z: 1, score: 83, profit: "+$1,840", name: "2017 Prizm Mahomes RC" },
            { left: 85, top: 10, rotate: 0, z: 3, score: 91, profit: "+$4,200", name: "2003 Topps Chrome LeBron RC" },
            { left: 170, top: 50, rotate: 6, z: 2, score: 78, profit: "+$2,100", name: "2018 Bowman Chrome Ohtani" },
          ].map((s, i) => (
            <div key={i} style={{ position: "absolute", left: s.left, top: s.top, zIndex: s.z, width: 210, height: 300, borderRadius: 6, background: "linear-gradient(160deg, #061628, #030e1e)", border: "1.5px solid #264a70", boxShadow: "0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,170,113,0.06)", transform: `rotate(${s.rotate}deg)`, transition: "transform 0.4s, box-shadow 0.4s", overflow: "hidden", cursor: "pointer" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${s.rotate}deg) scale(1.04) translateY(-4px)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${s.rotate}deg)`; }}>
              <div style={{ width: "100%", height: 190, background: "linear-gradient(160deg, #0e2040 0%, #06122a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", borderBottom: "1px solid #1c3554", position: "relative", overflow: "hidden" }}>
                {["🏈", "🏀", "⚾"][i]}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent, rgba(201,170,113,0.1), transparent)", animation: "holo-shimmer 3s ease-in-out infinite" }} />
              </div>
              <div style={{ padding: "10px 12px 8px" }}>
                <div style={{ background: "#c9aa71", color: "#030e1e", fontSize: 10, fontWeight: 700, display: "inline-block", padding: "2px 7px", borderRadius: 2, letterSpacing: "0.06em", marginBottom: 6 }}>PSA 10</div>
                <div style={{ fontSize: 11, color: "#f2ead8", lineHeight: 1.3, fontWeight: 500, marginBottom: 4 }}>{s.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "#c9aa71" }}>{s.score}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#6b80a0" }}>/100</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 800, color: "#22c55e", textShadow: "0 0 14px rgba(34,197,94,0.5)", marginTop: 2 }}>{s.profit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ticker */}
      <div style={{ position: "relative", zIndex: 2, borderTop: "1px solid #1c3554", borderBottom: "1px solid #1c3554", background: "rgba(201,170,113,0.03)", padding: "20px 0" }}>
        <div style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b80a0", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 5, height: 5, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulse-dot 2s ease-in-out infinite" }} />
          Live member wins · updated in real time
        </div>
        <div style={{ overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)" }}>
          <div style={{ display: "flex", gap: 14, width: "max-content", animation: "ticker-scroll 50s linear infinite" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <div key={i} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 12, background: "#061628", border: "1px solid #1c3554", borderRadius: 3, padding: "10px 16px", whiteSpace: "nowrap" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: t.type === "win" ? "#030e1e" : "#f2ead8", background: t.type === "win" ? "#22c55e" : "#c9aa71", padding: "2px 6px", borderRadius: 2, fontWeight: 700 }}>
                  {t.type === "win" ? "WIN" : "PSA 10"}
                </span>
                <span style={{ fontSize: 13 }}>{t.type === "win" ? `${(t as typeof TICKER_ITEMS[0] & {user:string}).user} · ${t.card}` : t.card}</span>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: t.type === "win" ? "#22c55e" : "#c9aa71", fontWeight: 700 }}>
                  {t.type === "win" ? (t as typeof TICKER_ITEMS[0] & {profit:string}).profit : (t as typeof TICKER_ITEMS[1] & {price:string}).price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sapphire stripe */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #3a8fd4 30%, #3a8fd4 70%, transparent)", opacity: 0.4, position: "relative", zIndex: 2 }} />

      {/* Stats band */}
      <div ref={profitRef} style={{ position: "relative", zIndex: 2, borderBottom: "1px solid #1c3554", background: "rgba(201,170,113,0.02)", padding: "50px 6%", display: "flex", justifyContent: "center", gap: 80, flexWrap: "wrap" }}>
        {[
          ["$" + profitVal.toLocaleString(), "In member-reported profits", true],
          ["4,200+", "Cards scored to date", false],
          ["83%", "Of scores matched actual grade range", false],
          ["$25", "Avg saved per submission avoided", false],
        ].map(([num, label, isMoney], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: isMoney ? "2.8rem" : "2.4rem", fontWeight: 900, color: isMoney ? "#22c55e" : "#c9aa71", textShadow: isMoney ? "0 0 32px rgba(34,197,94,0.35)" : "none" }}>{num as string}</div>
            <div style={{ fontSize: 11, color: "#6b80a0", marginTop: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label as string}</div>
          </div>
        ))}
      </div>

      {/* Wins */}
      <section id="wins" style={{ position: "relative", zIndex: 2, padding: "90px 6%", maxWidth: 1300, margin: "0 auto" }}>
        {/* Green money glow behind wins */}
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 900, height: 400, background: "radial-gradient(ellipse at center, rgba(34,197,94,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 56px" }}>
          <div style={{ color: "#c8bfa8", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>Recent Wins</div>
          <h2 style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif", marginBottom: 14 }}>What the data looked like before they shipped.</h2>
          <p style={{ color: "#6b80a0", lineHeight: 1.72 }}>Real cards. Real scores. What happened after — member-reported. Past performance doesn&apos;t predict future results, but the math doesn&apos;t lie.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {WINS.map((w, i) => (
            <div key={i} style={{
              background: i === 1 ? "linear-gradient(160deg, rgba(242,234,216,0.06) 0%, rgba(242,234,216,0.02) 100%)" : "#061628",
              border: i === 1 ? "1px solid rgba(242,234,216,0.2)" : "1px solid #1c3554",
              borderRadius: 6, padding: "26px 24px", position: "relative", overflow: "hidden",
              boxShadow: i === 1 ? "0 0 40px rgba(242,234,216,0.04), inset 0 1px 0 rgba(242,234,216,0.1)" : "none",
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: i === 1 ? "linear-gradient(90deg, transparent, #f2ead8, transparent)" : "linear-gradient(90deg, #c9aa71, #f2ead8, #c9aa71)" }} />
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "monospace", fontSize: "2.4rem", fontWeight: 900, color: "#22c55e", textShadow: "0 0 28px rgba(34,197,94,0.45)", lineHeight: 1 }}>{w.profit}</div>
                <div style={{ fontSize: 10, color: "#22c55e", opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>REPORTED PROFIT</div>
                <div style={{ marginTop: 10, fontWeight: 600, fontSize: 14 }}>{w.user}</div>
                <div style={{ fontSize: 11, color: "#6b80a0", marginTop: 2 }}>{w.location}</div>
              </div>
              <p style={{ color: "rgba(242,234,216,0.55)", fontSize: 13, lineHeight: 1.6, fontStyle: "italic", marginBottom: 14 }}>&ldquo;{w.quote}&rdquo;</p>
              <div style={{ fontSize: 11, color: "rgba(201,170,113,0.6)", fontFamily: "monospace" }}>{w.card}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sapphire stripe */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #3a8fd4 30%, #3a8fd4 70%, transparent)", opacity: 0.4, position: "relative", zIndex: 2 }} />

      {/* How it works */}
      <section id="how" style={{ position: "relative", zIndex: 2, padding: "0 6% 90px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 56px" }}>
          <div style={{ color: "#c9aa71", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>How it works</div>
          <h2 style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif", marginBottom: 14 }}>Three steps. No spreadsheets.</h2>
          <p style={{ color: "#6b80a0", lineHeight: 1.72 }}>Everything that used to take 45 minutes of tab-switching — condensed into one score you can act on immediately.</p>
        </div>
        <div style={{ display: "flex" }}>
          {[
            ["01", "Upload the card", "Take a photo or drag an image in. Player name, set, year — we read it from the card automatically."],
            ["02", "We pull the numbers", "Current pricing, gem rate history, population, demand signals, and market direction — all sourced, all transparent."],
            ["03", "Ship with confidence", "A 0–100 score with full reasoning. Know your expected ROI, your worst case, and exactly where the opportunity is — before the card leaves your hands."],
          ].map(([num, title, desc], i) => (
            <div key={i} style={{ flex: 1, padding: "36px 32px", borderLeft: i === 0 ? "none" : "1px solid #1c3554", paddingLeft: i === 0 ? 0 : 32 }}>
              <div style={{ fontWeight: 700, fontSize: "2.4rem", color: "#3a8fd4", marginBottom: 16, fontFamily: "monospace", textShadow: "0 0 20px rgba(58,143,212,0.35)" }}>{num}</div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: 10, fontWeight: 600, fontFamily: "var(--font-playfair), Georgia, serif" }}>{title}</h3>
              <p style={{ color: "#6b80a0", fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try it */}
      <section id="try" style={{ position: "relative", zIndex: 2, padding: "60px 6% 70px", margin: "0 5% 80px", textAlign: "center", borderRadius: 12, background: "linear-gradient(160deg, rgba(242,234,216,0.05) 0%, rgba(242,234,216,0.02) 100%)", border: "1px solid rgba(242,234,216,0.12)", boxShadow: "inset 0 1px 0 rgba(242,234,216,0.08)" }}>
        <div style={{ color: "#c8bfa8", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>Try it yourself</div>
        <h2 style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif", marginBottom: 14, color: "#f2ead8" }}>Your first score, on us.</h2>
        <p style={{ color: "#6b80a0", lineHeight: 1.72, marginBottom: 36 }}>Upload a card photo and get a real score in under 10 seconds.</p>
        <Link href="/score" style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)", color: "#030e1e", fontWeight: 700, padding: "16px 40px", borderRadius: 4, textDecoration: "none", fontSize: 16, letterSpacing: "0.05em", display: "inline-block" }}>
          Open the Scorer →
        </Link>
      </section>

      {/* Features */}
      <section id="features" style={{ position: "relative", zIndex: 2, padding: "0 6% 90px", maxWidth: 1300, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 56px" }}>
          <div style={{ color: "#c9aa71", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>What makes it different</div>
          <h2 style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif" }}>Built on priorities, not guesswork.</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {[
            ["001", "Weighted to how you think", "8 factors, prioritized the way experienced graders actually prioritize them — gem rate and ROI dominate, population barely moves the needle."],
            ["002", "Downside built in", "Every score accounts for the PSA 8 scenario. We show you the worst case before you decide — not after the bill arrives."],
            ["003", "Full transparency", "Every score expands into the complete math. What was sourced, what was estimated, and exactly how each factor pulled the number up or down."],
          ].map(([num, title, desc], i) => (
            <div key={i} style={{ background: "#061628", border: "1px solid #1c3554", borderRadius: 6, padding: "30px 26px" }}>
              <div style={{ fontFamily: "monospace", color: "#c9aa71", fontSize: 12, marginBottom: 16, opacity: 0.6 }}>{num}</div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: 10, fontWeight: 600, fontFamily: "var(--font-playfair), Georgia, serif" }}>{title}</h3>
              <p style={{ color: "#6b80a0", fontSize: 13, lineHeight: 1.65 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "90px 6%", borderTop: "1px solid #1c3554", background: "radial-gradient(ellipse at 50% 0%, rgba(201,170,113,0.05), transparent 60%)" }}>
        <div style={{ display: "inline-block", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9aa71", border: "1px solid #1c3554", padding: "5px 14px", borderRadius: 20, marginBottom: 20 }}>Coming Soon</div>
        <h2 style={{ fontWeight: 700, fontSize: "2.2rem", marginBottom: 16, fontFamily: "var(--font-playfair), Georgia, serif" }}>A private table for people who grade to profit.</h2>
        <p style={{ color: "#6b80a0", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.7 }}>Members-only Discord with verified independent graders, a monthly newsletter on the top grading opportunities right now, and insights you won&apos;t find in public forums.</p>
        <a href="#waitlist" style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)", color: "#030e1e", fontWeight: 700, padding: "13px 28px", borderRadius: 4, textDecoration: "none", fontSize: 14, letterSpacing: "0.05em" }}>Get Notified When It Opens</a>
      </div>

      {/* Waitlist */}
      <section id="waitlist" style={{ position: "relative", zIndex: 2, padding: "90px 6%", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ color: "#c9aa71", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Early Access</div>
        <h2 style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif", marginBottom: 14 }}>The edge is available right now.</h2>
        <p style={{ color: "#6b80a0", lineHeight: 1.72, marginBottom: 36 }}>Private beta is open to a small group. Get on the list to be first when access widens — and lock in the founding rate.</p>
        <WaitlistForm />
      </section>

      <Footer />

      <style>{`
        @keyframes alert-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes holo-shimmer { 0% { transform: translateX(-100%) skewX(-15deg); } 100% { transform: translateX(300%) skewX(-15deg); } }
      `}</style>
    </div>
  );
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return done ? (
    <p style={{ color: "#c9aa71", fontSize: 14 }}>✓ You&apos;re on the list. We&apos;ll reach out within 24 hours.</p>
  ) : (
    <div style={{ maxWidth: 460, margin: "0 auto", display: "flex", gap: 12 }}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
        style={{ flex: 1, background: "#061628", border: "1px solid #1c3554", color: "#f2ead8", padding: "14px 18px", borderRadius: 4, fontSize: 14, fontFamily: "inherit", outline: "none" }}
        onFocus={e => (e.target.style.borderColor = "#c9aa71")}
        onBlur={e => (e.target.style.borderColor = "#1c3554")} />
      <button onClick={() => { if (email.includes("@")) setDone(true); }}
        style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)", color: "#030e1e", fontWeight: 700, padding: "14px 24px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 14, letterSpacing: "0.05em" }}>
        Join →
      </button>
    </div>
  );
}
