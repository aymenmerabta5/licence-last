"use client";

import { useState } from "react";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { GraduationCap, Building2, ArrowRight, Zap, FileText, Sun, Moon } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

/* ═══════════════════════════════════════════════════════════════════
   Theme Palettes
   Dark  → "Deep Space Observatory"  — glowing constellations in void
   Light → "Celestial Cartography"   — star chart on quality paper
   ═══════════════════════════════════════════════════════════════════ */
const palettes = {
  dark: {
    bg: "#070B14",
    text: "#E0E7FF",
    heading: "#FFFFFF",
    sub: "rgba(224,231,255,0.6)",
    muted: "rgba(224,231,255,0.5)",
    faint: "rgba(224,231,255,0.4)",
    accent1: "#00E5FF",
    accent2: "#7C4DFF",
    accent3: "#E040FB",
    accent1Deep: "#00B8D4",
    btnText: "#000000",
    btnSecText: "#C5B3FF",
    btnSecBorder: "rgba(124,77,255,0.4)",
    gradientText: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 50%, #E040FB 100%)",
    gradientBtn: "linear-gradient(135deg, #00E5FF, #00B8D4)",
    gradientIcon: "linear-gradient(135deg, #00E5FF, #7C4DFF)",
    radialGlow: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)",
    hoverShadow: "0 0 30px rgba(0,229,255,0.3)",
    dotShadow: "0 0 8px #00E5FF",
    cardBorder: "rgba(255,255,255,0.06)",
    cardBg: "rgba(255,255,255,0.02)",
    cardHoverBorder: "rgba(255,255,255,0.12)",
    cardHoverBg: "rgba(255,255,255,0.04)",
    badgeBorder: "rgba(0,229,255,0.2)",
    badgeBg: "rgba(0,229,255,0.05)",
    svgOpacity: 0.3,
    featGradients: [
      "linear-gradient(135deg, #00E5FF, #00897B)",
      "linear-gradient(135deg, #7C4DFF, #3F1DCB)",
      "linear-gradient(135deg, #E040FB, #AA00FF)",
    ],
    statColors: ["#00E5FF", "#7C4DFF", "#E040FB", "#00E5FF"],
    toggleBg: "rgba(255,255,255,0.06)",
    toggleBorder: "rgba(255,255,255,0.1)",
  },
  light: {
    bg: "#F2F4F8",
    text: "#0F172A",
    heading: "#0F172A",
    sub: "rgba(15,23,42,0.55)",
    muted: "rgba(15,23,42,0.45)",
    faint: "rgba(15,23,42,0.35)",
    accent1: "#2563EB",
    accent2: "#7C3AED",
    accent3: "#C026D3",
    accent1Deep: "#1D4ED8",
    btnText: "#FFFFFF",
    btnSecText: "#7C3AED",
    btnSecBorder: "rgba(124,58,237,0.3)",
    gradientText: "linear-gradient(135deg, #1D4ED8 0%, #7C3AED 50%, #C026D3 100%)",
    gradientBtn: "linear-gradient(135deg, #2563EB, #1D4ED8)",
    gradientIcon: "linear-gradient(135deg, #2563EB, #7C3AED)",
    radialGlow: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 70%)",
    hoverShadow: "0 0 30px rgba(37,99,235,0.18)",
    dotShadow: "0 0 8px rgba(37,99,235,0.5)",
    cardBorder: "rgba(0,0,0,0.07)",
    cardBg: "rgba(255,255,255,0.6)",
    cardHoverBorder: "rgba(0,0,0,0.14)",
    cardHoverBg: "rgba(255,255,255,0.9)",
    badgeBorder: "rgba(37,99,235,0.18)",
    badgeBg: "rgba(37,99,235,0.06)",
    svgOpacity: 0.18,
    featGradients: [
      "linear-gradient(135deg, #2563EB, #1E40AF)",
      "linear-gradient(135deg, #7C3AED, #5B21B6)",
      "linear-gradient(135deg, #C026D3, #9333EA)",
    ],
    statColors: ["#2563EB", "#7C3AED", "#C026D3", "#2563EB"],
    toggleBg: "rgba(0,0,0,0.04)",
    toggleBorder: "rgba(0,0,0,0.1)",
  },
} as const;

const TRANSITION = "background-color 0.7s cubic-bezier(0.4,0,0.2,1), color 0.5s ease";
const TRANSITION_FAST = "all 0.5s cubic-bezier(0.4,0,0.2,1)";

export function DesignConstellation() {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? palettes.dark : palettes.light;

  const features = [
    {
      icon: GraduationCap,
      title: "Student Space",
      desc: "Build your digital CV, tag your skills, connect your GitHub, and discover internships filtered by location, technology, and type.",
      gradient: t.featGradients[0],
    },
    {
      icon: Building2,
      title: "Company Portal",
      desc: "Showcase your company, publish offers, and track candidates with a real-time dashboard. Accept talent and trigger automated agreements.",
      gradient: t.featGradients[1],
    },
    {
      icon: FileText,
      title: "Admin Hub",
      desc: "Validate placements, auto-generate Convention de Stage PDFs, and access global analytics on student placement rates.",
      gradient: t.featGradients[2],
    },
  ];

  const stats = [
    { value: "2,500+", label: "Students", color: t.statColors[0] },
    { value: "350+", label: "Companies", color: t.statColors[1] },
    { value: "45", label: "Universities", color: t.statColors[2] },
    { value: "96%", label: "Placement Rate", color: t.statColors[3] },
  ];

  return (
    <div className={outfit.className} style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: TRANSITION }}>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .constellation-node {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .constellation-line {
          stroke-dasharray: 6 4;
          animation: dash-flow 1.5s linear infinite;
        }
        .float-1 { animation: float-slow 6s ease-in-out infinite; }
        .float-2 { animation: float-med 5s ease-in-out infinite 0.5s; }
        .float-3 { animation: float-slow 7s ease-in-out infinite 1s; }
        .fade-up { animation: fade-in-up 0.8s ease-out both; }
        .fade-up-2 { animation: fade-in-up 0.8s ease-out 0.15s both; }
        .fade-up-3 { animation: fade-in-up 0.8s ease-out 0.3s both; }
        .fade-up-4 { animation: fade-in-up 0.8s ease-out 0.45s both; }
        @media (prefers-reduced-motion: reduce) {
          .constellation-node, .constellation-line, .float-1, .float-2, .float-3,
          .fade-up, .fade-up-2, .fade-up-3, .fade-up-4 {
            animation: none !important;
          }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ background: t.gradientIcon, transition: TRANSITION_FAST }}>
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight"
            style={{ color: t.heading, transition: "color 0.5s ease" }}>
            Stag.io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "For Students", "For Companies", "Pricing"].map((item) => (
            <span key={item} className="text-sm font-medium cursor-pointer transition-colors duration-200"
              style={{ color: t.muted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.accent1)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.muted)}>
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            style={{ background: t.toggleBg, border: `1px solid ${t.toggleBorder}` }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark
              ? <Sun className="h-4 w-4" style={{ color: "#FFD700" }} />
              : <Moon className="h-4 w-4" style={{ color: "#7C3AED" }} />}
          </button>
          <button className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
            style={{ background: t.gradientBtn, color: t.btnText, transition: TRANSITION_FAST }}
            aria-label="Launch the Stag.io app">
            Launch App
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative overflow-hidden px-8 lg:px-16 pt-12 pb-24">
        {/* Background constellation SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: t.svgOpacity, transition: "opacity 0.6s ease" }}
          viewBox="0 0 1200 700" fill="none" aria-hidden="true">
          {/* Constellation lines */}
          <line className="constellation-line" x1="150" y1="120" x2="400" y2="250" stroke={t.accent1} strokeWidth="1" />
          <line className="constellation-line" x1="400" y1="250" x2="700" y2="180" stroke={t.accent2} strokeWidth="1" style={{ animationDelay: "0.3s" }} />
          <line className="constellation-line" x1="700" y1="180" x2="950" y2="320" stroke={t.accent1} strokeWidth="1" style={{ animationDelay: "0.6s" }} />
          <line className="constellation-line" x1="400" y1="250" x2="600" y2="450" stroke={t.accent2} strokeWidth="1" style={{ animationDelay: "0.9s" }} />
          <line className="constellation-line" x1="600" y1="450" x2="950" y2="320" stroke={t.accent1} strokeWidth="1" style={{ animationDelay: "1.2s" }} />
          <line className="constellation-line" x1="150" y1="120" x2="300" y2="500" stroke={t.accent2} strokeWidth="1" style={{ animationDelay: "0.5s" }} />
          <line className="constellation-line" x1="300" y1="500" x2="600" y2="450" stroke={t.accent1} strokeWidth="1" style={{ animationDelay: "0.8s" }} />
          <line className="constellation-line" x1="950" y1="320" x2="1100" y2="150" stroke={t.accent2} strokeWidth="1" style={{ animationDelay: "1s" }} />
          {/* Nodes */}
          {[
            { cx: 150, cy: 120, r: 4, color: t.accent1, delay: "0s" },
            { cx: 400, cy: 250, r: 5, color: t.accent2, delay: "0.5s" },
            { cx: 700, cy: 180, r: 4, color: t.accent1, delay: "1s" },
            { cx: 950, cy: 320, r: 5, color: t.accent2, delay: "1.5s" },
            { cx: 600, cy: 450, r: 4, color: t.accent1, delay: "2s" },
            { cx: 300, cy: 500, r: 3, color: t.accent2, delay: "0.8s" },
            { cx: 1100, cy: 150, r: 3, color: t.accent1, delay: "1.3s" },
          ].map((n, i) => (
            <circle key={i} className="constellation-node" cx={n.cx} cy={n.cy} r={n.r} fill={n.color} style={{ animationDelay: n.delay }} />
          ))}
        </svg>

        {/* Radial gradient overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: t.radialGlow, transition: TRANSITION_FAST }} aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8"
            style={{ borderColor: t.badgeBorder, background: t.badgeBg, transition: TRANSITION_FAST }}>
            <span className="h-2 w-2 rounded-full" style={{ background: t.accent1, boxShadow: t.dotShadow }} />
            <span className={`${jetbrains.className} text-xs font-medium tracking-wider`} style={{ color: t.accent1 }}>
              UNIVERSITY ↔ ENTERPRISE MATCHING
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            style={{ color: t.heading, textWrap: "balance" }}>
            Where Talent Meets{" "}
            <span style={{
              backgroundImage: t.gradientText,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}>
              Opportunity
            </span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up-3 mx-auto max-w-2xl text-lg font-light leading-relaxed mb-10"
            style={{ color: t.sub, transition: "color 0.5s ease" }}>
            A centralized platform connecting students with companies through
            skill-based matching, automated internship agreements, and real-time placement tracking.
          </p>

          {/* CTAs */}
          <div className="fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              style={{ background: t.gradientBtn, color: t.btnText, boxShadow: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = t.hoverShadow)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              aria-label="Find your internship">
              Find Your Internship
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
              style={{ borderColor: t.btnSecBorder, color: t.btnSecText, transition: TRANSITION_FAST }}
              aria-label="Post an internship offer">
              Post an Offer
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className={`float-${(i % 3) + 1} rounded-2xl border p-6 text-center transition-all duration-300 hover:border-opacity-60`}
              style={{
                borderColor: `${stat.color}20`,
                background: `linear-gradient(135deg, ${stat.color}08, transparent)`,
                transition: TRANSITION_FAST,
              }}>
              <div className={`${jetbrains.className} text-3xl font-medium mb-1`} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium tracking-wider uppercase" style={{ color: t.faint }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="group relative rounded-2xl border p-8 transition-all duration-500 hover:translate-y-[-4px]"
              style={{
                borderColor: t.cardBorder,
                background: t.cardBg,
                transition: TRANSITION_FAST,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.cardHoverBorder;
                e.currentTarget.style.background = t.cardHoverBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.cardBorder;
                e.currentTarget.style.background = t.cardBg;
              }}>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: feat.gradient }}>
                <feat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: t.heading, transition: "color 0.5s ease" }}>
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: t.muted }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
