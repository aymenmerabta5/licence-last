"use client";

import { Outfit, JetBrains_Mono } from "next/font/google";
import { Briefcase, GraduationCap, Building2, ArrowRight, Zap, Globe, FileText } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export function DesignConstellation() {
  return (
    <div className={outfit.className} style={{ background: "#070B14", color: "#E0E7FF", minHeight: "100vh" }}>
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
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
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
        .orbiter { animation: orbit 20s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .constellation-node, .constellation-line, .float-1, .float-2, .float-3,
          .fade-up, .fade-up-2, .fade-up-3, .fade-up-4, .orbiter {
            animation: none !important;
          }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #00E5FF, #7C4DFF)" }}>
            <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "For Students", "For Companies", "Pricing"].map((item) => (
            <span key={item} className="text-sm font-medium cursor-pointer transition-colors duration-200"
              style={{ color: "rgba(224,231,255,0.5)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00E5FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,231,255,0.5)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-full px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #00E5FF, #00B8D4)" }}
          aria-label="Launch the Stag.io app">
          Launch App
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative overflow-hidden px-8 lg:px-16 pt-12 pb-24">
        {/* Background constellation SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 1200 700" fill="none" aria-hidden="true">
          {/* Constellation lines */}
          <line className="constellation-line" x1="150" y1="120" x2="400" y2="250" stroke="#00E5FF" strokeWidth="1" />
          <line className="constellation-line" x1="400" y1="250" x2="700" y2="180" stroke="#7C4DFF" strokeWidth="1" style={{ animationDelay: "0.3s" }} />
          <line className="constellation-line" x1="700" y1="180" x2="950" y2="320" stroke="#00E5FF" strokeWidth="1" style={{ animationDelay: "0.6s" }} />
          <line className="constellation-line" x1="400" y1="250" x2="600" y2="450" stroke="#7C4DFF" strokeWidth="1" style={{ animationDelay: "0.9s" }} />
          <line className="constellation-line" x1="600" y1="450" x2="950" y2="320" stroke="#00E5FF" strokeWidth="1" style={{ animationDelay: "1.2s" }} />
          <line className="constellation-line" x1="150" y1="120" x2="300" y2="500" stroke="#7C4DFF" strokeWidth="1" style={{ animationDelay: "0.5s" }} />
          <line className="constellation-line" x1="300" y1="500" x2="600" y2="450" stroke="#00E5FF" strokeWidth="1" style={{ animationDelay: "0.8s" }} />
          <line className="constellation-line" x1="950" y1="320" x2="1100" y2="150" stroke="#7C4DFF" strokeWidth="1" style={{ animationDelay: "1s" }} />
          {/* Nodes */}
          {[
            { cx: 150, cy: 120, r: 4, color: "#00E5FF", delay: "0s" },
            { cx: 400, cy: 250, r: 5, color: "#7C4DFF", delay: "0.5s" },
            { cx: 700, cy: 180, r: 4, color: "#00E5FF", delay: "1s" },
            { cx: 950, cy: 320, r: 5, color: "#7C4DFF", delay: "1.5s" },
            { cx: 600, cy: 450, r: 4, color: "#00E5FF", delay: "2s" },
            { cx: 300, cy: 500, r: 3, color: "#7C4DFF", delay: "0.8s" },
            { cx: 1100, cy: 150, r: 3, color: "#00E5FF", delay: "1.3s" },
          ].map((n, i) => (
            <circle key={i} className="constellation-node" cx={n.cx} cy={n.cy} r={n.r} fill={n.color} style={{ animationDelay: n.delay }} />
          ))}
        </svg>

        {/* Radial gradient overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)" }} aria-hidden="true" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-up inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8"
            style={{ borderColor: "rgba(0,229,255,0.2)", background: "rgba(0,229,255,0.05)" }}>
            <span className="h-2 w-2 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px #00E5FF" }} />
            <span className={`${jetbrains.className} text-xs font-medium tracking-wider`} style={{ color: "#00E5FF" }}>
              UNIVERSITY ↔ ENTERPRISE MATCHING
            </span>
          </div>

          {/* Headline */}
          <h1 className="fade-up-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-6"
            style={{ textWrap: "balance" }}>
            Where Talent Meets{" "}
            <span style={{
              background: "linear-gradient(135deg, #00E5FF 0%, #7C4DFF 50%, #E040FB 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Opportunity
            </span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up-3 mx-auto max-w-2xl text-lg font-light leading-relaxed mb-10"
            style={{ color: "rgba(224,231,255,0.6)" }}>
            A centralized platform connecting students with companies through
            skill-based matching, automated internship agreements, and real-time placement tracking.
          </p>

          {/* CTAs */}
          <div className="fade-up-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-black transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              style={{ background: "linear-gradient(135deg, #00E5FF, #00B8D4)" }}
              aria-label="Find your internship">
              Find Your Internship
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
              style={{ borderColor: "rgba(124,77,255,0.4)", color: "#C5B3FF" }}
              aria-label="Post an internship offer">
              Post an Offer
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "2,500+", label: "Students", color: "#00E5FF" },
            { value: "350+", label: "Companies", color: "#7C4DFF" },
            { value: "45", label: "Universities", color: "#E040FB" },
            { value: "96%", label: "Placement Rate", color: "#00E5FF" },
          ].map((stat, i) => (
            <div key={i} className={`float-${(i % 3) + 1} rounded-2xl border p-6 text-center transition-all duration-300 hover:border-opacity-60`}
              style={{
                borderColor: `${stat.color}20`,
                background: `linear-gradient(135deg, ${stat.color}08, transparent)`,
              }}>
              <div className={`${jetbrains.className} text-3xl font-medium mb-1`} style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs font-medium tracking-wider uppercase" style={{ color: "rgba(224,231,255,0.4)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: "Student Space",
              desc: "Build your digital CV, tag your skills, connect your GitHub, and discover internships filtered by location, technology, and type.",
              gradient: "linear-gradient(135deg, #00E5FF, #00897B)",
            },
            {
              icon: Building2,
              title: "Company Portal",
              desc: "Showcase your company, publish offers, and track candidates with a real-time dashboard. Accept talent and trigger automated agreements.",
              gradient: "linear-gradient(135deg, #7C4DFF, #3F1DCB)",
            },
            {
              icon: FileText,
              title: "Admin Hub",
              desc: "Validate placements, auto-generate Convention de Stage PDFs, and access global analytics on student placement rates.",
              gradient: "linear-gradient(135deg, #E040FB, #AA00FF)",
            },
          ].map((feat, i) => (
            <div key={i} className="group relative rounded-2xl border p-8 transition-all duration-500 hover:translate-y-[-4px]"
              style={{
                borderColor: "rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              }}>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: feat.gradient }}>
                <feat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">{feat.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(224,231,255,0.5)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
