"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      position: "relative", zIndex: 2,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "32px 6%", borderTop: "1px solid #1c3554",
      color: "#6b80a0", fontSize: 12,
      background: "#030e1e",
    }}>
      <Link href="/" style={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: 13, textDecoration: "none", color: "#f2ead8" }}>
        GRADE<span style={{ color: "#c9aa71" }}>ABILITY</span>
      </Link>
      <div style={{ display: "flex", gap: 24 }}>
        {[
          { href: "/", label: "Home" },
          { href: "/score", label: "Calculator" },
          { href: "/pricing", label: "Pricing" },
          { href: "/#how", label: "How It Works" },
          { href: "/#waitlist", label: "Waitlist" },
        ].map(({ href, label }) => (
          <Link key={href} href={href} style={{ color: "#6b80a0", textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#c9aa71")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6b80a0")}>
            {label}
          </Link>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#2a4060" }}>© 2025 Gradeability Score</div>
    </footer>
  );
}
