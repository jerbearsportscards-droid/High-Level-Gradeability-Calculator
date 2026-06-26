"use client";
import Link from "next/link";
import { useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it before you commit. No card required.",
    cta: "Start Free",
    ctaLink: "/score",
    highlight: false,
    features: [
      "3 calculator uses total",
      "AI card identification",
      "Full score breakdown",
      "No newsletter",
      "No discord access",
    ],
    missing: ["Newsletter", "Discord & grading network", "Market forecasts", "Quarterly professional call"],
  },
  {
    name: "Starter",
    price: "$9.99",
    period: "per month",
    description: "For the collector who wants data before every submission.",
    cta: "Get Started",
    ctaLink: "#waitlist",
    highlight: false,
    features: [
      "15 calculator uses per month",
      "AI card identification",
      "Full score breakdown",
      "Monthly newsletter — 1 high-ROI pick",
      "Email support",
    ],
    missing: ["Discord & grading network", "Market forecasts", "Quarterly professional call"],
  },
  {
    name: "Pro",
    price: "$32.99",
    period: "per month",
    description: "For serious submitters who grade to profit consistently.",
    cta: "Go Pro",
    ctaLink: "#waitlist",
    highlight: true,
    badge: "Most Popular",
    features: [
      "100 calculator uses per month",
      "AI card identification",
      "Full score breakdown",
      "Monthly newsletter — 5 best cards to grade",
      "Access to premium Discord",
      "Access to grading professional network",
      "Priority email support",
    ],
    missing: ["Market forecasts", "Quarterly professional call"],
  },
  {
    name: "Elite",
    price: "$149.99",
    period: "per month",
    description: "For operators who treat card grading as a serious investment.",
    cta: "Join Elite",
    ctaLink: "#waitlist",
    highlight: false,
    badge: "Best Value",
    features: [
      "1,000 calculator uses per month",
      "AI card identification",
      "Full score breakdown",
      "Monthly newsletter — 15 picks + 3-month forecasts",
      "Market forecasts based on news & player performance",
      "Access to premium Discord",
      "Access to grading professional network",
      "Quarterly 1-on-1 call with a grading professional",
      "Priority support",
    ],
    missing: [],
  },
];

const FAQS = [
  { q: "How does the calculator work?", a: "You upload a photo of your card. Our AI identifies the player, set, parallel, and auto status, then runs it through an 8-factor scoring engine — ROI potential, gem rate, PSA premium, athlete demand, downside protection, and more. You get a 0–100 score in under 10 seconds." },
  { q: "What counts as a calculator use?", a: "Each card photo you upload and score counts as one use. Adjusting the sliders or re-running the same card does not count." },
  { q: "What's in the newsletter?", a: "Every month we research the market and identify the highest-ROI grading opportunities right now — specific cards, specific parallels, with the data behind each pick. Starter gets 1 pick. Pro gets 5. Elite gets 15 plus 3-month forecasts." },
  { q: "Who are the grading professionals?", a: "PSA and BGS submitters with verified track records — people who have graded thousands of cards and know which sets, parallels, and conditions come back PSA 10. Elite members get a quarterly call with one of them." },
  { q: "Can I cancel anytime?", a: "Yes. No contracts, no annual lock-in. Cancel any time from your account settings and you keep access until the end of your billing period." },
  { q: "Do unused calculator uses roll over?", a: "No, they reset monthly. If you need more in a given month, you can upgrade your tier at any time." },
];

export default function Pricing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: "#030e1e", color: "#f2ead8", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif", minHeight: "100vh" }}>

      {/* Ambient glow */}
      <div style={{ position: "fixed", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 1200, height: 600, background: "radial-gradient(ellipse at center, rgba(201,170,113,0.05) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Nav */}
      <Nav />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "70px 6% 56px", maxWidth: 700, margin: "0 auto" }}>
        <div style={{ color: "#c9aa71", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
        <h1 style={{ fontWeight: 700, fontSize: "2.6rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif", lineHeight: 1.15, marginBottom: 18 }}>
          The edge pays for itself<br />
          <span style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>on the first card.</span>
        </h1>
        <p style={{ color: "#6b80a0", fontSize: "1.05rem", lineHeight: 1.72 }}>
          One bad submission costs $25 in grading fees plus whatever the card loses in value. Gradeability Score pays for itself the moment it saves you from one wrong call.
        </p>
      </div>

      {/* Pricing grid */}
      <div style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, padding: "0 5% 80px", maxWidth: 1300, margin: "0 auto" }}>
        {TIERS.map((tier) => (
          <div key={tier.name} style={{
            background: tier.highlight ? "linear-gradient(160deg, #0f1922, #061628)" : "#061628",
            border: tier.highlight ? "1.5px solid #c9aa71" : "1px solid #1c3554",
            borderRadius: 16,
            padding: "32px 26px",
            position: "relative",
            boxShadow: tier.highlight ? "0 0 40px rgba(201,170,113,0.1)" : "none",
            display: "flex",
            flexDirection: "column",
          }}>
            {tier.badge && (
              <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: tier.highlight ? "linear-gradient(135deg, #e2c98a, #c9aa71)" : "#264a70", color: tier.highlight ? "#030e1e" : "#c9aa71", fontSize: 10, fontWeight: 700, padding: "4px 14px", borderRadius: 20, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                {tier.badge}
              </div>
            )}

            <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", color: tier.highlight ? "#c9aa71" : "#6b80a0", textTransform: "uppercase" }}>{tier.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: "2.2rem", fontWeight: 900, fontFamily: "monospace", color: "#f2ead8" }}>{tier.price}</span>
              <span style={{ fontSize: 12, color: "#6b80a0" }}>{tier.period}</span>
            </div>
            <p style={{ fontSize: 13, color: "#6b80a0", lineHeight: 1.55, marginBottom: 28, minHeight: 50 }}>{tier.description}</p>

            <Link href={tier.ctaLink} style={{
              display: "block", textAlign: "center", padding: "13px 0", borderRadius: 8, fontWeight: 700, fontSize: 13, letterSpacing: "0.05em", textDecoration: "none", marginBottom: 28,
              background: tier.highlight ? "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)" : "transparent",
              color: tier.highlight ? "#030e1e" : "#c9aa71",
              border: tier.highlight ? "none" : "1px solid #1c3554",
            }}>
              {tier.cta}
            </Link>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#2a4060", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>What&apos;s included</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#22c55e", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: "#c8bfa8", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                {tier.missing.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", opacity: 0.3 }}>
                    <span style={{ color: "#6b80a0", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✕</span>
                    <span style={{ fontSize: 13, color: "#6b80a0", lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 760, margin: "0 auto", padding: "0 6% 100px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ color: "#c9aa71", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14 }}>FAQ</div>
          <h2 style={{ fontWeight: 700, fontSize: "1.8rem", letterSpacing: "-0.01em", fontFamily: "var(--font-playfair), Georgia, serif" }}>Common questions</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: "1px solid #1c3554" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#f2ead8" }}>{faq.q}</span>
                <span style={{ color: "#c9aa71", fontSize: 18, flexShrink: 0, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ fontSize: 14, color: "#6b80a0", lineHeight: 1.72, paddingBottom: 20 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "60px 6% 80px", borderTop: "1px solid #1c3554", background: "radial-gradient(ellipse at 50% 0%, rgba(201,170,113,0.05), transparent 60%)" }}>
        <h2 style={{ fontWeight: 700, fontSize: "1.8rem", marginBottom: 14, fontFamily: "var(--font-playfair), Georgia, serif" }}>Start with 3 free scores.</h2>
        <p style={{ color: "#6b80a0", marginBottom: 32, lineHeight: 1.7 }}>No credit card. No commitment. Just upload a card and see what the data says.</p>
        <Link href="/score" style={{ background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)", color: "#030e1e", fontWeight: 700, padding: "15px 36px", borderRadius: 4, textDecoration: "none", fontSize: 15, letterSpacing: "0.05em", display: "inline-block" }}>
          Score My First Card Free →
        </Link>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
