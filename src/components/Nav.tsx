"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();

  const links = [
    { href: "/#wins", label: "Recent Wins" },
    { href: "/#how", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/score", label: "Score a Card" },
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "18px 6%",
      background: "rgba(5,12,22,0.94)",
      borderBottom: "1px solid #1c3554",
      backdropFilter: "blur(12px)",
    }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textDecoration: "none", color: "#f2ead8" }}>
        GRADE<span style={{ color: "#c9aa71" }}>ABILITY</span>
      </Link>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {links.map(({ href, label }) => {
          const active = path === href || (href === "/pricing" && path === "/pricing") || (href === "/score" && path === "/score");
          return (
            <Link key={href} href={href} style={{
              color: active ? "#c9aa71" : "#6b80a0",
              textDecoration: "none", fontSize: 13,
              letterSpacing: "0.03em", transition: "color 0.2s",
              fontWeight: active ? 600 : 400,
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c9aa71")}
              onMouseLeave={e => (e.currentTarget.style.color = active ? "#c9aa71" : "#6b80a0")}>
              {label}
            </Link>
          );
        })}
        <Link href="/score" style={{
          background: "linear-gradient(135deg, #e2c98a, #c9aa71, #a88a50)",
          color: "#030e1e", fontWeight: 700, fontSize: 13,
          padding: "10px 22px", borderRadius: 4, textDecoration: "none",
          letterSpacing: "0.05em",
        }}>
          Try Free →
        </Link>
      </div>
    </nav>
  );
}
