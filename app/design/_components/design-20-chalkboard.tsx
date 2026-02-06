"use client";

import { useState } from "react";
import { Patrick_Hand, Nunito } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, BookOpen, PenLine, Sun, Moon } from "lucide-react";

const chalk = Patrick_Hand({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

/* ═══════════════════════════════════════════════════════════════════
   Theme Palettes
   Dark  → "Late Night Classroom"  — old chalkboard, chalk dust, wooden frame
   Light → "Morning Whiteboard"    — clean dry-erase board, aluminum frame, marker ink
   ═══════════════════════════════════════════════════════════════════ */
const palettes = {
  dark: {
    bg: "#2D3436",
    text: "#E8E2D4",
    muted50: "rgba(232,226,212,0.5)",
    muted40: "rgba(232,226,212,0.4)",
    muted30: "rgba(232,226,212,0.3)",
    muted25: "rgba(232,226,212,0.25)",
    muted12: "rgba(232,226,212,0.12)",
    muted08: "rgba(232,226,212,0.08)",
    muted03: "rgba(232,226,212,0.03)",
    muted20: "rgba(232,226,212,0.2)",
    /* Accent colors — chalk hues */
    accent1: "#7EC8E3",   /* cyan chalk */
    accent2: "#FFD93D",   /* yellow chalk */
    accent3: "#FF8A80",   /* pink chalk */
    accent4: "#A5D6A7",   /* green chalk */
    /* CTA */
    ctaPrimaryBg: "#7EC8E3",
    ctaPrimaryText: "#2D3436",
    ctaSecBorder: "rgba(255,217,61,0.3)",
    ctaSecText: "#FFD93D",
    ctaSecHoverBg: "rgba(255,217,61,0.05)",
    /* Frame */
    frameStart: "#5C4033",
    frameEnd: "#4A3328",
    /* Texture */
    textureBg: "linear-gradient(145deg, #2D3436 0%, #303A3C 30%, #2B3233 60%, #2D3436 100%)",
    noiseOpacity: 0.04,
    dustOpacity: 1,
    /* Underline stroke */
    underlineStroke: "#7EC8E3",
    /* Toggle */
    toggleLabel: "Whiteboard",
    toggleIcon: "☀",
  },
  light: {
    bg: "#F8FAFB",
    text: "#2D3436",
    muted50: "rgba(45,52,54,0.50)",
    muted40: "rgba(45,52,54,0.40)",
    muted30: "rgba(45,52,54,0.30)",
    muted25: "rgba(45,52,54,0.22)",
    muted12: "rgba(45,52,54,0.12)",
    muted08: "rgba(45,52,54,0.06)",
    muted03: "rgba(45,52,54,0.02)",
    muted20: "rgba(45,52,54,0.15)",
    /* Accent colors — dry-erase marker hues */
    accent1: "#0277BD",   /* blue marker */
    accent2: "#E65100",   /* orange marker */
    accent3: "#2E7D32",   /* green marker */
    accent4: "#7B1FA2",   /* purple marker */
    /* CTA */
    ctaPrimaryBg: "#0277BD",
    ctaPrimaryText: "#FFFFFF",
    ctaSecBorder: "rgba(230,81,0,0.3)",
    ctaSecText: "#E65100",
    ctaSecHoverBg: "rgba(230,81,0,0.04)",
    /* Frame */
    frameStart: "#B8C0C8",
    frameEnd: "#A0A8B0",
    /* Texture */
    textureBg: "linear-gradient(145deg, #F8FAFB 0%, #F2F5F7 30%, #F5F7F9 60%, #F8FAFB 100%)",
    noiseOpacity: 0,
    dustOpacity: 0,
    /* Underline stroke */
    underlineStroke: "#0277BD",
    /* Toggle */
    toggleLabel: "Chalkboard",
    toggleIcon: "✎",
  },
} as const;

const TRANSITION = "background-color 0.7s cubic-bezier(0.4,0,0.2,1), color 0.5s ease";
const TRANSITION_FAST = "all 0.5s cubic-bezier(0.4,0,0.2,1)";

export function DesignChalkboard() {
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? palettes.dark : palettes.light;

  const features = [
    { icon: GraduationCap, title: "Student Desk", desc: "Build your digital notebook. Tag skills like sticky notes, link your GitHub, and search the board for opportunities.", color: t.accent1 },
    { icon: Building2, title: "Company Podium", desc: "Present to the class. Post offers on the bulletin, review applicants, and hand out acceptance letters.", color: t.accent2 },
    { icon: FileText, title: "Dean's Office", desc: "Stamp the official papers. Auto-generate Convention de Stage. Track who's placed and who's still looking.", color: t.accent3 },
  ];

  const stats = [
    { value: "2,500+", label: "Students", color: t.accent1 },
    { value: "350+", label: "Companies", color: t.accent2 },
    { value: "45", label: "Universities", color: t.accent3 },
    { value: "96%", label: "Placed", color: t.accent4 },
  ];

  return (
    <div className={nunito.className} style={{ background: t.bg, color: t.text, minHeight: "100vh", overflow: "hidden", transition: TRANSITION }}>
      <style>{`
        @keyframes chalk-write {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dust-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.6; }
        }
        @keyframes chalk-underline {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .chalk-in { animation: chalk-write 0.5s ease-out both; }
        .chalk-in-2 { animation: chalk-write 0.5s ease-out 0.1s both; }
        .chalk-in-3 { animation: chalk-write 0.5s ease-out 0.2s both; }
        .chalk-in-4 { animation: chalk-write 0.5s ease-out 0.3s both; }
        .chalk-in-5 { animation: chalk-write 0.5s ease-out 0.4s both; }
        .dust { animation: dust-float 4s ease-in-out infinite; }
        .dust-2 { animation: dust-float 5s ease-in-out 1s infinite; }
        .dust-3 { animation: dust-float 6s ease-in-out 2s infinite; }
        .chalk-line {
          transform-origin: left;
          animation: chalk-underline 0.8s ease-out 0.4s both;
        }
        .board-card {
          border: 2px dashed ${t.muted12};
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .board-card:hover {
          border-color: ${t.muted25};
          background: ${t.muted03};
          transform: translateY(-3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .chalk-in, .chalk-in-2, .chalk-in-3, .chalk-in-4, .chalk-in-5,
          .dust, .dust-2, .dust-3, .chalk-line {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Board texture background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: t.textureBg, transition: TRANSITION_FAST }} />

      {/* Noise grain — visible only in dark/chalkboard mode */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{
          opacity: t.noiseOpacity,
          transition: "opacity 0.6s ease",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)'/%3E%3C/svg%3E")`,
        }} />

      {/* Chalk dust particles — fade out in light mode */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{ opacity: t.dustOpacity, transition: "opacity 0.8s ease" }}>
        {[
          { t: "20%", l: "15%", s: 3, cls: "dust" },
          { t: "35%", l: "75%", s: 2, cls: "dust-2" },
          { t: "60%", l: "25%", s: 4, cls: "dust-3" },
          { t: "45%", l: "85%", s: 2, cls: "dust" },
          { t: "75%", l: "45%", s: 3, cls: "dust-2" },
          { t: "15%", l: "55%", s: 2, cls: "dust-3" },
        ].map((d, i) => (
          <div key={i} className={`absolute rounded-full ${d.cls}`}
            style={{ top: d.t, left: d.l, width: d.s, height: d.s, background: isDark ? "#E8E2D4" : "#2D3436" }} />
        ))}
      </div>

      {/* Frame border — wood (dark) / aluminum (light) */}
      <div className="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-3"
          style={{ background: `linear-gradient(to bottom, ${t.frameStart}, ${t.frameEnd})`, transition: TRANSITION_FAST }} />
        <div className="absolute bottom-0 left-0 right-0 h-3"
          style={{ background: `linear-gradient(to top, ${t.frameStart}, ${t.frameEnd})`, transition: TRANSITION_FAST }} />
        <div className="absolute top-0 bottom-0 left-0 w-3"
          style={{ background: `linear-gradient(to right, ${t.frameStart}, ${t.frameEnd})`, transition: TRANSITION_FAST }} />
        <div className="absolute top-0 bottom-0 right-0 w-3"
          style={{ background: `linear-gradient(to left, ${t.frameStart}, ${t.frameEnd})`, transition: TRANSITION_FAST }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-10 lg:px-20 pt-8 pb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" style={{ color: t.muted50, transition: "color 0.5s ease" }} />
          <span className={`${chalk.className} text-2xl`} style={{ transition: "color 0.5s ease" }}>Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Lesson 1", "Lesson 2", "Lesson 3", "Office Hours"].map((item) => (
            <span key={item} className={`${chalk.className} text-base cursor-pointer transition-colors duration-200`}
              style={{ color: t.muted30 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.accent2)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.muted30)}>
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle — chalkboard ↔ whiteboard */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className={`${chalk.className} border-2 border-dashed px-3.5 py-1.5 text-sm transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none`}
            style={{ borderColor: t.muted20, color: t.accent2, transition: TRANSITION_FAST }}
            aria-label={isDark ? "Switch to whiteboard mode" : "Switch to chalkboard mode"}>
            {isDark
              ? <span className="flex items-center gap-1.5"><Sun className="h-3.5 w-3.5" /> Whiteboard</span>
              : <span className="flex items-center gap-1.5"><Moon className="h-3.5 w-3.5" /> Chalkboard</span>}
          </button>
          <button className={`${chalk.className} border-2 border-dashed px-5 py-2 text-base transition-all duration-300 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none`}
            style={{ borderColor: t.muted20, color: t.text, transition: TRANSITION_FAST }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.muted08)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Enroll in Stag.io">
            Enroll &rarr;
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-20 px-10 lg:px-20 pt-16 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* "Today's lesson" header */}
          <div className="chalk-in flex items-center gap-3 mb-6">
            <PenLine className="h-4 w-4" style={{ color: t.accent2, transition: "color 0.5s ease" }} />
            <span className={`${chalk.className} text-lg`} style={{ color: t.accent2, transition: "color 0.5s ease" }}>
              Today&apos;s Lesson:
            </span>
          </div>

          <h1 className={`${chalk.className} chalk-in-2`}
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 1.05, color: t.text, textWrap: "balance", transition: "color 0.5s ease" }}>
            Finding Your{" "}
            <span className="relative inline-block">
              <span style={{ color: t.accent1, transition: "color 0.5s ease" }}>Internship</span>
              {/* Wavy underline */}
              <svg className="chalk-line absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                <path d="M0 6 Q30 2 60 8 Q90 12 120 6 Q150 1 180 7 Q210 12 240 5 Q270 0 300 7"
                  stroke={t.underlineStroke} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"
                  style={{ transition: "stroke 0.5s ease" }} />
              </svg>
            </span>
          </h1>

          <div className="chalk-in-3 mt-10 grid md:grid-cols-2 gap-10">
            <div>
              <p className={`${chalk.className} text-xl leading-relaxed`} style={{ color: t.muted50, transition: "color 0.5s ease" }}>
                Step 1: Build your profile<br />
                Step 2: Search by skills<br />
                Step 3: Apply &amp; match<br />
                Step 4: Get your Convention de Stage!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {["Skill-based matching", "Auto document generation", "University validation", "Real-time tracking"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`${chalk.className} text-lg`} style={{ color: t.accent2, transition: "color 0.5s ease" }}>&#10003;</span>
                  <span className={`${chalk.className} text-lg`} style={{ color: t.muted50, transition: "color 0.5s ease" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chalk-in-4 mt-10 flex flex-col sm:flex-row items-start gap-4">
            <button className={`${chalk.className} group flex items-center gap-2 px-8 py-3.5 text-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`}
              style={{ background: t.ctaPrimaryBg, color: t.ctaPrimaryText, transition: TRANSITION_FAST }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 20px ${t.accent1}25`)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              aria-label="Start learning">
              Start Learning
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className={`${chalk.className} group flex items-center gap-2 border-2 border-dashed px-8 py-3.5 text-xl transition-all duration-300 focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none`}
              style={{ borderColor: t.ctaSecBorder, color: t.ctaSecText, transition: TRANSITION_FAST }}
              onMouseEnter={(e) => (e.currentTarget.style.background = t.ctaSecHoverBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Post a teaching offer">
              Post Offer
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-20 px-10 lg:px-20 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div key={i} className="board-card chalk-in-5 p-7 cursor-pointer">
              <feat.icon className="h-6 w-6 mb-4" style={{ color: feat.color, transition: "color 0.5s ease" }} />
              <h3 className={`${chalk.className} text-2xl mb-2`} style={{ color: feat.color, transition: "color 0.5s ease" }}>
                {feat.title}
              </h3>
              <p className={`${chalk.className} text-base leading-relaxed`} style={{ color: t.muted40, transition: "color 0.5s ease" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-20 px-10 lg:px-20 pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={i} className="chalk-in-5">
              <div className={`${chalk.className} text-4xl mb-1`} style={{ color: s.color, transition: "color 0.5s ease" }}>
                {s.value}
              </div>
              <div className={`${chalk.className} text-base`} style={{ color: t.muted25, transition: "color 0.5s ease" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
