"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { calculateGradeability, DEFAULT_INPUTS, type CardInputs, type GradeabilityResult } from "@/lib/gradeabilityFormula";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ── Upload states ────────────────────────────────────────────────
type UploadState = "idle" | "dragging" | "analyzing" | "done";

// ── AI Summary generator ─────────────────────────────────────────
// Builds a plain-English explanation from the real formula output.
// Real Claude API call replaces this in the next session.
function buildSummary(label: string, inputs: CardInputs, result: GradeabilityResult): string {
  const totalCost = inputs.rawCost + inputs.gradingFee;
  const roiF = result.factorScores.find(f => f.name === "ROI Potential");
  const gemF = result.factorScores.find(f => f.name === "Gem Rate (PSA 10%)");
  const popF = result.factorScores.find(f => f.name === "Population Control");
  const downsideF = result.factorScores.find(f => f.name === "Downside Protection");

  const verdictLine =
    result.score >= 80 ? `This card is a strong grading candidate.`
    : result.score >= 65 ? `This card makes sense to grade.`
    : result.score >= 45 ? `This card is borderline — it could go either way.`
    : result.score >= 30 ? `This card is not worth grading at current prices.`
    : `Do not grade this card right now.`;

  const roiLine = result.expectedROI >= 0
    ? `Your expected return is +${result.expectedROI.toFixed(0)}%, a profit of roughly $${result.expectedProfit.toFixed(0)} after your $${totalCost} all-in cost.`
    : `The numbers don't work — you're looking at a projected loss of $${Math.abs(result.expectedProfit).toFixed(0)} after your $${totalCost} all-in cost.`;

  const gemLine = inputs.gemRate <= 15
    ? `The gem rate is the biggest concern here at just ${inputs.gemRate}% — most cards coming back will not be PSA 10s, which is where all the upside lives.`
    : inputs.gemRate <= 30
    ? `A ${inputs.gemRate}% gem rate is workable but not great. Roughly 1 in ${Math.round(100/inputs.gemRate)} cards hits a PSA 10.`
    : `The gem rate is solid at ${inputs.gemRate}%, meaning you have a real shot at the top grade.`;

  const popLine = inputs.popTotal <= 50
    ? `Population is low at ${inputs.popTotal} PSA 10s, which keeps scarcity working in your favor.`
    : inputs.popTotal <= 200
    ? `There are ${inputs.popTotal} PSA 10s in the population — manageable, but worth watching as more get graded.`
    : `Population is elevated at ${inputs.popTotal} PSA 10s. Supply is growing and that can put downward pressure on prices.`;

  const demandLine = inputs.athleteDemand >= 8
    ? `Athlete demand is high (${inputs.athleteDemand}/10), which helps on the resale side.`
    : inputs.athleteDemand >= 5
    ? `Demand is moderate (${inputs.athleteDemand}/10). There's a market, but you may need to be patient when selling.`
    : `Demand is soft (${inputs.athleteDemand}/10). A slow market means longer hold times and more price risk.`;

  const downsideLine = downsideF && downsideF.score < 40
    ? `If the card comes back PSA 8, you lose money — downside protection is weak.`
    : `Even a PSA 8 keeps you close to breakeven, which limits your worst-case scenario.`;

  const breakLine = result.breakEvenGrade !== "No grade covers cost"
    ? `You need at least a ${result.breakEvenGrade} to cover your costs.`
    : `No grade level recovers your full cost — this is high-risk territory.`;

  return [verdictLine, roiLine, gemLine, popLine, demandLine, downsideLine, breakLine].join(" ");
}

export default function Home() {
  const [inputs, setInputs] = useState<CardInputs>(DEFAULT_INPUTS);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [cardLabel, setCardLabel] = useState<string | null>(null);
  const [pendingInputs, setPendingInputs] = useState<CardInputs | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [typedText, setTypedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => calculateGradeability(inputs), [inputs]);
  const set = (key: keyof CardInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // Only show score once analysis is fully complete and inputs are filled
  const hasCard = uploadState === "done";
  const displayScore = hasCard ? result.score : 0;

  // Score ring math
  const circumference = 2 * Math.PI * 52;
  const dashOffset = hasCard
    ? circumference - (displayScore / 100) * circumference
    : circumference; // full offset = empty ring

  const scoreColor =
    !hasCard ? "#264a70"
    : displayScore >= 85 ? "#c9aa71"
    : displayScore >= 65 ? "#22c55e"
    : displayScore >= 40 ? "#f97316"
    : "#ef4444";

  // ── Animated fill ────────────────────────────────────────────────
  const animateToTarget = useCallback((target: CardInputs) => {
    const DURATION = 900;
    const STEPS = 45;
    const interval = DURATION / STEPS;
    let step = 0;

    const ticker = setInterval(() => {
      step++;
      const t = 1 - Math.pow(1 - step / STEPS, 3);

      setInputs((prev) => {
        const lerp = (a: number, b: number) => Math.round(a + (b - a) * t);
        return {
          rawCost:       lerp(prev.rawCost,       target.rawCost),
          gradingFee:    lerp(prev.gradingFee,     target.gradingFee),
          psa10Value:    lerp(prev.psa10Value,     target.psa10Value),
          psa9Value:     lerp(prev.psa9Value,      target.psa9Value),
          psa8Value:     lerp(prev.psa8Value,      target.psa8Value),
          gemRate:       lerp(prev.gemRate,        target.gemRate),
          nineRate:      lerp(prev.nineRate,       target.nineRate),
          eightRate:     lerp(prev.eightRate,      target.eightRate),
          popTotal:      lerp(prev.popTotal,       target.popTotal),
          athleteDemand: lerp(prev.athleteDemand,  target.athleteDemand),
          cardLiquidity: lerp(prev.cardLiquidity,  target.cardLiquidity),
        };
      });

      if (step >= STEPS) clearInterval(ticker);
    }, interval);
  }, []);

  // ── Upload / drag handlers ───────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setCardImage(url);
    setUploadState("analyzing");
    setCardLabel(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const mediaType = file.type;

      try {
        const res = await fetch("/api/analyze-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });

        if (!res.ok) throw new Error("API error");
        const data = await res.json();

        const cardInputs: CardInputs = {
          rawCost:       data.rawCost       ?? 0,
          gradingFee:    data.gradingFee     ?? 25,
          psa10Value:    data.psa10Value     ?? 0,
          psa9Value:     data.psa9Value      ?? 0,
          psa8Value:     data.psa8Value      ?? 0,
          gemRate:       data.gemRate        ?? 0,
          nineRate:      data.nineRate       ?? 0,
          eightRate:     data.eightRate      ?? 0,
          popTotal:      data.popTotal       ?? 0,
          athleteDemand: data.athleteDemand  ?? 5,
          cardLiquidity: data.cardLiquidity  ?? 5,
        };

        const label = data.cardName ?? "Card";
        setCardLabel(label);
        setAiConfidence(data.confidence ?? "medium");
        setUploadState("done");
        animateToTarget(cardInputs);

        setTimeout(() => {
          const finalResult = calculateGradeability(cardInputs);
          const summary = buildSummary(label, cardInputs, finalResult);
          setSummaryText(summary);
          setTypedText("");
          setShowSummary(true);
        }, 1100);
      } catch {
        setUploadState("idle");
        alert("Couldn't read the card — try a clearer photo.");
      }
    };
    reader.readAsDataURL(file);
  }, [animateToTarget]);

  // ── Confirm card handler ─────────────────────────────────────────
  const confirmCard = useCallback(() => {
    if (!pendingInputs || !cardLabel) return;
    setShowConfirm(false);
    setUploadState("done");
    animateToTarget(pendingInputs);
    setTimeout(() => {
      const finalResult = calculateGradeability(pendingInputs);
      const summary = buildSummary(cardLabel, pendingInputs, finalResult);
      setSummaryText(summary);
      setTypedText("");
      setShowSummary(true);
    }, 1100);
  }, [pendingInputs, cardLabel, animateToTarget]);

  // ── Typewriter effect ────────────────────────────────────────────
  useEffect(() => {
    if (!showSummary || !summaryText) return;
    setTypedText("");
    let i = 0;
    const ticker = setInterval(() => {
      i++;
      setTypedText(summaryText.slice(0, i));
      if (i >= summaryText.length) clearInterval(ticker);
    }, 18);
    return () => clearInterval(ticker);
  }, [showSummary, summaryText]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setUploadState("dragging"); };
  const onDragLeave = () => setUploadState("idle");
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ background: "#030e1e", minHeight: "100vh" }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <Nav />

      {/* ── HERO ────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: "#2a4060", marginBottom: 8 }}>
          GRADEABILITY SCORE
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.5px", color: "#f2ead8", marginBottom: 6, fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Should you grade this card?
        </h1>
        <p style={{ fontSize: 15, color: "#6b80a0", maxWidth: 480 }}>
          Upload a photo — we handle the rest. Get a score in seconds.
        </p>
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* LEFT — Upload + Inputs (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* UPLOAD CARD */}
            <Card>
              <SectionLabel>Step 1 — Upload your card</SectionLabel>

              <div
                className={`drop-zone${uploadState === "dragging" ? " drag-over" : ""}`}
                style={{ borderRadius: 14, padding: 24, cursor: "pointer", position: "relative" }}
                onClick={() => fileRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
              >
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileInput} />

                {uploadState === "idle" || uploadState === "dragging" ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                    <p style={{ color: "#f2ead8", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
                      Drop your card photo here
                    </p>
                    <p style={{ color: "#6b80a0", fontSize: 13 }}>
                      or tap to browse · JPG, PNG, HEIC
                    </p>
                    {uploadState === "dragging" && (
                      <p style={{ color: "#c9aa71", fontSize: 13, marginTop: 8, fontWeight: 600 }}>Release to upload</p>
                    )}
                  </div>
                ) : uploadState === "analyzing" ? (
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {cardImage && (
                      <img src={cardImage} alt="card" style={{ width: 72, height: 100, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Spinner />
                        <span style={{ color: "#c9aa71", fontWeight: 700, fontSize: 14 }}>Analyzing card…</span>
                      </div>
                      <p style={{ color: "#6b80a0", fontSize: 13 }}>Reading player, year, set · Pulling PSA pop · Fetching market prices</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }} className="fade-in">
                    {cardImage && (
                      <img src={cardImage} alt="card" style={{ width: 72, height: 100, objectFit: "cover", borderRadius: 8, flexShrink: 0, border: "2px solid #c9aa71" }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ color: "#22c55e", fontSize: 16 }}>✓</span>
                        <span style={{ color: "#22c55e", fontWeight: 700, fontSize: 14 }}>Card identified</span>
                      </div>
                      <p style={{ color: "#f2ead8", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{cardLabel}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadState("idle"); setCardImage(null); setCardLabel(null); setShowSummary(false); }}
                        style={{ fontSize: 12, color: "#6b80a0", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
                      >
                        Upload different card
                      </button>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, color: "#c9aa71", fontWeight: 700, letterSpacing: "0.08em" }}>AUTO-FILLED</span>
                    </div>
                  </div>
                )}
              </div>

              {uploadState !== "done" && (
                <p style={{ fontSize: 12, color: "#2a4060", textAlign: "center", marginTop: 12 }}>
                  AI reads your card and fills everything below automatically
                </p>
              )}
            </Card>

            {/* FINANCIALS */}
            <Card>
              <SectionLabel>Step 2 — Confirm the numbers</SectionLabel>
              <p style={{ fontSize: 12, color: "#2a4060", marginBottom: 16, marginTop: -6 }}>These auto-fill from your card photo. Adjust if needed.</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <NumberInput label="Raw Card Cost" prefix="$" value={inputs.rawCost} onChange={(v) => set("rawCost", v)} />
                <NumberInput label="Grading Fee" prefix="$" value={inputs.gradingFee} onChange={(v) => set("gradingFee", v)} hint="PSA/BGS tier" />
                <div>
                  <FieldLabel>Total Cost</FieldLabel>
                  <div style={{ background: "#030e1e", border: "1px solid #1c3554", borderRadius: 12, padding: "12px 14px" }}>
                    <span style={{ fontWeight: 800, fontSize: 20, color: "#c9aa71" }}>
                      ${(inputs.rawCost + inputs.gradingFee).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <NumberInput label="PSA 10 Value" prefix="$" value={inputs.psa10Value} onChange={(v) => set("psa10Value", v)} accent />
                <NumberInput label="PSA 9 Value" prefix="$" value={inputs.psa9Value} onChange={(v) => set("psa9Value", v)} />
                <NumberInput label="PSA 8 Value" prefix="$" value={inputs.psa8Value} onChange={(v) => set("psa8Value", v)} />
              </div>
            </Card>

            {/* GRADING ODDS + MARKET */}
            <Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SectionLabel>Grading Odds</SectionLabel>
                  <div className="flex flex-col gap-4 mt-3">
                    <SliderInput label="PSA 10 Gem Rate" value={inputs.gemRate} onChange={(v) => set("gemRate", v)} color="#c6f135" unit="%" max={90} />
                    <SliderInput label="PSA 9 Rate" value={inputs.nineRate} onChange={(v) => set("nineRate", v)} color="#00d26a" unit="%" max={90} />
                    <SliderInput label="PSA 8 Rate" value={inputs.eightRate} onChange={(v) => set("eightRate", v)} color="#ffb547" unit="%" max={80} />
                  </div>
                  <div style={{ marginTop: 12, background: "#030e1e", border: "1px solid #1c3554", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#2a4060" }}>Below PSA 8</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#6b80a0" }}>
                      {Math.max(0, 100 - inputs.gemRate - inputs.nineRate - inputs.eightRate)}%
                    </span>
                  </div>
                </div>
                <div>
                  <SectionLabel>Market Factors</SectionLabel>
                  <div className="flex flex-col gap-4 mt-3">
                    <NumberInput label="PSA 10 Pop Count" value={inputs.popTotal} onChange={(v) => set("popTotal", v)} hint="Total graded PSA 10s" />
                    <SliderInput label="Athlete Demand" value={inputs.athleteDemand} onChange={(v) => set("athleteDemand", v)} color="#a78bfa" unit="/10" max={10} min={1} step={1} hint="1 = bench · 10 = all-time great" />
                    <SliderInput label="Card Liquidity" value={inputs.cardLiquidity} onChange={(v) => set("cardLiquidity", v)} color="#60a5fa" unit="/10" max={10} min={1} step={1} hint="1 = hard sell · 10 = instant flip" />
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* RIGHT — Score Panel (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* SCORE HERO */}
            <div style={{
              background: "#061628",
              border: "1px solid #1c3554",
              borderRadius: 20,
              padding: "32px 24px",
              textAlign: "center",
              position: "sticky",
              top: 20
            }}>
              {/* Ring */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <svg width="210" height="210" viewBox="0 0 160 160" className={hasCard ? "score-glow" : "ring-shimmer"} suppressHydrationWarning>
                  {Array.from({ length: 20 }).map((_, i) => {
                    const angle = (i / 20) * 360 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const r1 = 70, r2 = 74;
                    return (
                      <line key={i}
                        x1={parseFloat((80 + r1 * Math.cos(rad)).toFixed(2))}
                        y1={parseFloat((80 + r1 * Math.sin(rad)).toFixed(2))}
                        x2={parseFloat((80 + r2 * Math.cos(rad)).toFixed(2))}
                        y2={parseFloat((80 + r2 * Math.sin(rad)).toFixed(2))}
                        stroke="#1c3554" strokeWidth="1.5"
                      />
                    );
                  })}
                  <circle cx="80" cy="80" r="52" fill="none" stroke={hasCard ? "#101820" : "rgba(201,170,113,0.15)"} strokeWidth="12" />
                  <circle
                    cx="80" cy="80" r="52"
                    fill="none"
                    stroke={hasCard ? scoreColor : "#c9aa71"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 80 80)"
                    style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1), stroke 0.4s ease" }}
                  />
                  {hasCard && <>
                    <text x="80" y="88" textAnchor="middle" fontSize="38" fontWeight="900" fill={scoreColor}
                      style={{ transition: "fill 0.4s ease", fontFamily: "-apple-system, sans-serif" }}>
                      {result.score}
                    </text>
                  </>}
                </svg>
              </div>

              {/* Verdict + stats — only shown after upload */}
              {!hasCard ? (
                <p style={{ fontSize: 13, color: "#c9aa71", marginBottom: 24, fontWeight: 600, letterSpacing: "0.03em", textShadow: "0 0 12px rgba(201,170,113,0.4)" }}>Upload a card to see your score</p>
              ) : (
                <div>
                  <div style={{
                    display: "inline-block",
                    background: `${scoreColor}18`,
                    border: `1px solid ${scoreColor}35`,
                    borderRadius: 100,
                    padding: "6px 20px",
                    marginBottom: 24
                  }}>
                    <span style={{ fontSize: 15, fontWeight: 900, letterSpacing: "0.12em", color: scoreColor }}>
                      {result.verdict}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {[
                      { label: "Expected ROI", value: `${result.expectedROI >= 0 ? "+" : ""}${result.expectedROI.toFixed(0)}%`, color: result.expectedROI >= 0 ? "#22c55e" : "#ef4444" },
                      { label: "Exp. Profit", value: `${result.expectedProfit >= 0 ? "+$" : "-$"}${Math.abs(result.expectedProfit).toFixed(0)}`, color: result.expectedProfit >= 0 ? "#22c55e" : "#ef4444" },
                      { label: "Break-Even", value: result.breakEvenGrade, color: "#6b80a0" },
                      { label: "Risk", value: result.riskLevel, color: result.riskLevel === "LOW" ? "#22c55e" : result.riskLevel === "MEDIUM" ? "#f59e0b" : result.riskLevel === "HIGH" ? "#e07040" : "#ef4444" },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: "#030e1e", border: "1px solid #1c3554", borderRadius: 12, padding: "12px 14px", textAlign: "left" }}>
                        <div style={{ fontSize: 11, color: "#2a4060", marginBottom: 4, fontWeight: 600, letterSpacing: "0.04em" }}>{label.toUpperCase()}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid #1c3554", paddingTop: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#2a4060", marginBottom: 14, textAlign: "left" }}>FACTOR BREAKDOWN</p>
                    <div className="flex flex-col gap-3">
                      {result.factorScores.filter(f => f.name !== "Population Control").map((f) => {
                        const barColor = f.score >= 70 ? "#c9aa71" : f.score >= 45 ? "#f59e0b" : "#ef4444";
                        const tooltips: Record<string, string> = {
                          "ROI Potential": "Expected return on your total investment (card cost + grading fee). The single biggest driver of your score at 28% weight.",
                          "PSA 10 Premium": "How much more a PSA 10 is worth vs. the raw card. A higher premium means grading unlocks serious value. Counts for 20%.",
                          "Gem Rate (PSA 10%)": "Your estimated chance of pulling a PSA 10. Higher odds = less risk. Weighted at 17% — the second biggest swing factor.",
                          "Athlete Demand": "How hot is this player right now? Hype drives buyers and keeps prices up. Worth 15% of your score.",
                          "Grading Cost Efficiency": "The grading fee as a share of your expected payout. Cheaper relative to value = better. Counts for 8%.",
                          "Downside Protection": "If the card only grades a PSA 8, do you still come out ahead? Measures your floor. Worth 7%.",
                          "Market Liquidity": "How fast and easy is it to sell this card once graded? Illiquid cards tie up your money. Worth 5%.",
                        };
                        return (
                          <div key={f.name}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ fontSize: 11, color: "#6b80a0" }}>{f.name}</span>
                                <FactorTooltip text={tooltips[f.name]} />
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <span style={{ fontSize: 11, color: "#2a4060" }}>{f.weight}%</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>{f.score.toFixed(0)}</span>
                              </div>
                            </div>
                            <div style={{ height: 3, background: "#1c3554", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${f.score}%`, background: barColor, borderRadius: 2, transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid #1c3554" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2a4060", letterSpacing: "0.08em" }}>TOTAL</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: scoreColor }}>{result.score}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── AI SUMMARY PANEL ──────────────────────────────────── */}
        {showSummary && (
          <div className="fade-in" style={{ marginTop: 20 }}>
            <div style={{
              background: "#061628",
              border: "1px solid #1c3554",
              borderRadius: 20,
              padding: "24px 28px",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Accent bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, #c9aa71, transparent)`
              }} />

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: "rgba(201,170,113,0.1)", border: "1px solid rgba(201,170,113,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14
                }}>✦</div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b80a0", marginBottom: 1 }}>AI ANALYSIS</p>
                  <p style={{ fontSize: 12, color: "#2a4060" }}>{cardLabel}</p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                    color: scoreColor,
                    background: `${scoreColor}15`,
                    border: `1px solid ${scoreColor}30`,
                    borderRadius: 100, padding: "3px 10px"
                  }}>{result.verdict}</span>
                </div>
              </div>

              <p style={{
                fontSize: 15, lineHeight: 1.75, color: "#c8bfa8",
                fontWeight: 400, maxWidth: 860,
              }}>
                {typedText}
                <span style={{
                  display: "inline-block", width: 2, height: "1em",
                  background: "#c9aa71", marginLeft: 2, verticalAlign: "text-bottom",
                  opacity: typedText.length < summaryText.length ? 1 : 0,
                  animation: "blink 0.7s step-end infinite"
                }} />
              </p>

              <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>

              <div style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Gem Rate", value: `${inputs.gemRate}%`, warn: inputs.gemRate < 20 },
                  { label: "PSA 10 Value", value: `$${inputs.psa10Value.toLocaleString()}` },
                  { label: "All-In Cost", value: `$${(inputs.rawCost + inputs.gradingFee).toLocaleString()}` },
                  { label: "Expected ROI", value: `${result.expectedROI >= 0 ? "+" : ""}${result.expectedROI.toFixed(0)}%`, warn: result.expectedROI < 0 },
                  { label: "Break-Even", value: result.breakEvenGrade },
                ].map(({ label, value, warn }) => (
                  <div key={label} style={{
                    fontSize: 12, padding: "5px 12px", borderRadius: 100,
                    background: warn ? "rgba(239,68,68,0.08)" : "#0f1520",
                    border: `1px solid ${warn ? "rgba(239,68,68,0.2)" : "#264a70"}`,
                    color: warn ? "#ef4444" : "#6b80a0",
                  }}>
                    <span style={{ color: "#2a4060" }}>{label}: </span>
                    <span style={{ fontWeight: 700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}

// ── Helper components ────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#061628", border: "1px solid #1c3554", borderRadius: 20, padding: "20px 22px" }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#6b80a0", marginBottom: 14 }}>{children}</p>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, color: "#6b80a0", fontWeight: 600, marginBottom: 6 }}>{children}</p>;
}

function FactorTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        style={{ width: 13, height: 13, borderRadius: "50%", background: "#1c3554", border: "1px solid #2a4060", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#6b80a0", cursor: "default", flexShrink: 0 }}
      >i</span>
      {visible && (
        <div style={{ position: "absolute", left: "50%", bottom: "calc(100% + 6px)", transform: "translateX(-50%)", background: "#061628", border: "1px solid #264a70", borderRadius: 8, padding: "8px 10px", width: 200, fontSize: 11, color: "#c8bfa8", lineHeight: 1.5, zIndex: 50, pointerEvents: "none" }}>
          {text}
        </div>
      )}
    </div>
  );
}

function NumberInput({ label, value, onChange, prefix, min = 0, max = 999999, step = 1, hint, accent }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; min?: number; max?: number; step?: number; hint?: string; accent?: boolean;
}) {
  const [display, setDisplay] = useState(value === 0 ? "" : String(value));
  useEffect(() => {
    setDisplay(value === 0 ? "" : String(value));
  }, [value]);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{
        display: "flex", alignItems: "center",
        background: "#0a1e34",
        border: `1px solid ${accent ? "rgba(201,170,113,0.3)" : "#264a70"}`,
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {prefix && <span style={{ paddingLeft: 12, color: "#2a4060", fontSize: 14 }}>{prefix}</span>}
        <input
          type="number" value={display} min={min} max={max} step={step}
          onChange={(e) => setDisplay(e.target.value)}
          onBlur={(e) => {
            const num = Math.max(min, Math.min(max, Number(e.target.value) || 0));
            onChange(num);
            setDisplay(num === 0 ? "" : String(num));
          }}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "11px 12px", fontSize: 14, fontWeight: 700, color: "#f2ead8" }}
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: "#2a4060", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SliderInput({ label, value, onChange, color, unit, max = 100, min = 0, step = 1, hint }: {
  label: string; value: number; onChange: (v: number) => void;
  color: string; unit: string; max?: number; min?: number; step?: number; hint?: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#6b80a0" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: color }} />
      {hint && <p style={{ fontSize: 11, color: "#2a4060", marginTop: 2 }}>{hint}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" fill="none" stroke="#c9aa71" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10" strokeLinecap="round" />
    </svg>
  );
}
