"use client";

import { useState, useMemo } from "react";
import { calculateGradeability, DEFAULT_INPUTS, type CardInputs } from "@/lib/gradeabilityFormula";

export default function Home() {
  const [inputs, setInputs] = useState<CardInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => calculateGradeability(inputs), [inputs]);

  const set = (key: keyof CardInputs, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  const scoreColor =
    result.score >= 80 ? "#00d4aa"
    : result.score >= 65 ? "#39d353"
    : result.score >= 45 ? "#f59e0b"
    : result.score >= 30 ? "#f97316"
    : "#ef4444";

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (result.score / 100) * circumference;

  return (
    <div className="min-h-screen" style={{ background: "#080808" }}>
      {/* Header */}
      <header style={{ background: "#0d0d0d", borderBottom: "1px solid #1a1a1a" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "linear-gradient(135deg, #00d4aa, #39d353)", color: "#080808" }}>
              G
            </div>
            <span className="font-semibold text-lg tracking-tight" style={{ color: "#f5f5f5" }}>Gradeability Score</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#1a1a1a", color: "#00d4aa", border: "1px solid #00d4aa30" }}>BETA</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "#666" }}>
            <span className="cursor-pointer hover:text-white transition-colors" style={{ color: "#00d4aa" }}>Calculator</span>
            <span className="cursor-pointer hover:text-white transition-colors">Dashboard</span>
            <span className="cursor-pointer hover:text-white transition-colors">Collection</span>
            <span className="cursor-pointer hover:text-white transition-colors">Watchlist</span>
          </nav>
          <button className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80" style={{ background: "#00d4aa", color: "#080808" }}>
            Sign Up
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#f5f5f5" }}>Gradeability Calculator</h1>
          <p className="text-sm" style={{ color: "#666" }}>Enter your card&apos;s data to get a 0–100 score on whether it&apos;s worth grading.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — inputs */}
          <div className="lg:col-span-2 space-y-4">

            <Section title="Financial Inputs" icon="$">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Raw Card Cost" prefix="$" value={inputs.rawCost} onChange={(v) => set("rawCost", v)} min={1} max={100000} step={1} />
                <InputField label="Grading Fee" prefix="$" value={inputs.gradingFee} onChange={(v) => set("gradingFee", v)} min={1} max={500} step={1} hint="PSA/BGS service tier" />
                <StatDisplay label="Total Cost" value={`$${(inputs.rawCost + inputs.gradingFee).toFixed(0)}`} sub="all-in cost" accent />
              </div>
            </Section>

            <Section title="Expected Grade Values" icon="📊">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="PSA 10 Value" prefix="$" value={inputs.psa10Value} onChange={(v) => set("psa10Value", v)} min={0} max={1000000} step={1} highlight="teal" />
                <InputField label="PSA 9 Value" prefix="$" value={inputs.psa9Value} onChange={(v) => set("psa9Value", v)} min={0} max={500000} step={1} />
                <InputField label="PSA 8 Value" prefix="$" value={inputs.psa8Value} onChange={(v) => set("psa8Value", v)} min={0} max={200000} step={1} />
              </div>
            </Section>

            <Section title="Grading Odds" icon="🎯">
              <p className="text-xs mb-4" style={{ color: "#555" }}>Estimate the probability distribution for your card&apos;s condition. Rates should sum to ≤100%.</p>
              <div className="space-y-5">
                <SliderField label="PSA 10 Gem Rate" value={inputs.gemRate} onChange={(v) => set("gemRate", v)} color="#00d4aa" unit="%" max={90} />
                <SliderField label="PSA 9 Rate" value={inputs.nineRate} onChange={(v) => set("nineRate", v)} color="#39d353" unit="%" max={90} />
                <SliderField label="PSA 8 Rate" value={inputs.eightRate} onChange={(v) => set("eightRate", v)} color="#f59e0b" unit="%" max={80} />
              </div>
              <div className="mt-4 p-3 rounded-lg flex items-center justify-between" style={{ background: "#0d0d0d" }}>
                <span className="text-xs" style={{ color: "#555" }}>Below PSA 8 (implied)</span>
                <span className="text-sm font-mono font-semibold" style={{ color: "#666" }}>
                  {Math.max(0, 100 - inputs.gemRate - inputs.nineRate - inputs.eightRate).toFixed(0)}%
                </span>
              </div>
            </Section>

            <Section title="Market Factors" icon="📈">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <InputField label="PSA 10 Pop Count" value={inputs.popTotal} onChange={(v) => set("popTotal", v)} min={0} max={50000} step={1} hint="Total PSA 10s graded" />
              </div>
              <div className="space-y-5">
                <SliderField label="Athlete Demand" value={inputs.athleteDemand} onChange={(v) => set("athleteDemand", v)} color="#a78bfa" unit="/10" max={10} min={1} step={1} hint="1 = bench player  •  10 = all-time superstar" />
                <SliderField label="Card Liquidity" value={inputs.cardLiquidity} onChange={(v) => set("cardLiquidity", v)} color="#60a5fa" unit="/10" max={10} min={1} step={1} hint="1 = very hard to sell  •  10 = instant sale" />
              </div>
            </Section>

          </div>

          {/* Right column — score */}
          <div className="space-y-4">

            <div className="rounded-2xl p-6 text-center" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              <div className="flex justify-center mb-4">
                <svg width="140" height="140" viewBox="0 0 140 140" className="score-glow">
                  <circle cx="70" cy="70" r="54" fill="none" stroke="#1e1e1e" strokeWidth="10" />
                  <circle
                    cx="70" cy="70" r="54"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 70 70)"
                    style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
                  />
                  <text x="70" y="65" textAnchor="middle" fontSize="32" fontWeight="800" fill={scoreColor} style={{ transition: "fill 0.4s ease" }}>
                    {result.score}
                  </text>
                  <text x="70" y="83" textAnchor="middle" fontSize="10" fill="#555" letterSpacing="2">
                    /100
                  </text>
                </svg>
              </div>

              <div className="mb-4">
                <div className="text-xs mb-1" style={{ color: "#555" }}>VERDICT</div>
                <div className="text-xl font-black tracking-widest" style={{ color: result.verdictColor, transition: "color 0.4s ease" }}>
                  {result.verdict}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MiniStat
                  label="Expected ROI"
                  value={`${result.expectedROI >= 0 ? "+" : ""}${result.expectedROI.toFixed(0)}%`}
                  color={result.expectedROI >= 0 ? "#39d353" : "#ef4444"}
                />
                <MiniStat
                  label="Exp. Profit"
                  value={`${result.expectedProfit >= 0 ? "+$" : "-$"}${Math.abs(result.expectedProfit).toFixed(0)}`}
                  color={result.expectedProfit >= 0 ? "#39d353" : "#ef4444"}
                />
                <MiniStat label="Break-Even" value={result.breakEvenGrade} color="#888" />
                <MiniStat
                  label="Risk Level"
                  value={result.riskLevel}
                  color={result.riskLevel === "LOW" ? "#39d353" : result.riskLevel === "MEDIUM" ? "#f59e0b" : result.riskLevel === "HIGH" ? "#f97316" : "#ef4444"}
                />
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
              <h3 className="text-xs font-semibold mb-4 tracking-widest" style={{ color: "#555" }}>FACTOR BREAKDOWN</h3>
              <div className="space-y-3">
                {result.factorScores.map((f) => (
                  <div key={f.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: "#888" }}>{f.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: "#555" }}>{f.weight}%</span>
                        <span className="text-xs font-semibold" style={{ color: f.score >= 70 ? "#00d4aa" : f.score >= 45 ? "#f59e0b" : "#ef4444" }}>
                          {f.score.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1e1e1e" }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${f.score}%`,
                          background: f.score >= 70 ? "#00d4aa" : f.score >= 45 ? "#f59e0b" : "#ef4444"
                        }}
                      />
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "#444" }}>{f.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid #1e1e1e" }}>
                <span className="text-xs font-semibold tracking-widest" style={{ color: "#555" }}>TOTAL SCORE</span>
                <span className="text-lg font-black" style={{ color: scoreColor }}>{result.score}/100</span>
              </div>
            </div>

            <p className="text-xs text-center px-2" style={{ color: "#333" }}>
              Not financial advice. Grading outcomes vary. Verify PSA pop data and market values independently.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "#111", border: "1px solid #1e1e1e" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h2 className="text-sm font-semibold tracking-wide" style={{ color: "#f5f5f5" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({
  label, value, onChange, prefix, min = 0, max = 999999, step = 1, hint, highlight,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; min?: number; max?: number; step?: number;
  hint?: string; highlight?: string;
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#666" }}>{label}</label>
      <div className="relative flex items-center rounded-xl overflow-hidden" style={{
        background: "#161616",
        border: `1px solid ${highlight === "teal" ? "#00d4aa40" : "#222"}`,
      }}>
        {prefix && <span className="pl-3 text-sm" style={{ color: "#555" }}>{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
          style={{ color: "#f5f5f5" }}
        />
      </div>
      {hint && <p className="text-xs mt-1" style={{ color: "#444" }}>{hint}</p>}
    </div>
  );
}

function SliderField({
  label, value, onChange, color, unit, max = 100, min = 0, step = 1, hint
}: {
  label: string; value: number; onChange: (v: number) => void;
  color: string; unit: string; max?: number; min?: number; step?: number; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs" style={{ color: "#888" }}>{label}</label>
        <span className="text-sm font-bold" style={{ color }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: color }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: "#444" }}>{hint}</p>}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
      <div className="text-xs mb-1" style={{ color: "#555" }}>{label}</div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function StatDisplay({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#666" }}>{label}</label>
      <div className="rounded-xl px-4 py-3" style={{ background: "#0d0d0d", border: "1px solid #1e1e1e" }}>
        <div className="text-xl font-bold" style={{ color: accent ? "#00d4aa" : "#f5f5f5" }}>{value}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: "#444" }}>{sub}</div>}
      </div>
    </div>
  );
}
