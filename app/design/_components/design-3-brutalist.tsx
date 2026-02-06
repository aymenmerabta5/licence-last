"use client";

import { Space_Mono } from "next/font/google";
import { ArrowRight, Terminal, Code, Zap, Shield, FileText, Search } from "lucide-react";

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export function DesignBrutalist() {
  return (
    <div className={spaceMono.className} style={{ background: "#F0F0E8", color: "#000", minHeight: "100vh" }}>
      <style>{`
        @keyframes blink-cursor {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes type-in {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes glitch-shift {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(2px, -1px); }
          60% { transform: translate(-1px, -2px); }
          80% { transform: translate(1px, 1px); }
        }
        .cursor-blink::after {
          content: "█";
          animation: blink-cursor 1s step-end infinite;
          color: #C5F82A;
        }
        .brutal-border { border: 3px solid #000; }
        .brutal-border-thin { border: 2px solid #000; }
        .hover-invert:hover {
          background: #000 !important;
          color: #C5F82A !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .cursor-blink::after { animation: none; opacity: 1; }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-6 lg:px-12 pt-6 pb-4"
        style={{ borderBottom: "3px solid #000" }}>
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" strokeWidth={2.5} />
          <span className="text-lg font-bold tracking-tight">STAG.IO</span>
        </div>
        <div className="hidden md:flex items-center gap-0">
          {["/platform", "/students", "/companies", "/docs"].map((item) => (
            <span key={item} className="hover-invert px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-150"
              style={{ borderLeft: "2px solid #000" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="brutal-border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-150 hover:bg-[#C5F82A] hover:border-[#C5F82A] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
          aria-label="Log in to Stag.io">
          [ LOG IN ]
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative px-6 lg:px-12 pt-12 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Terminal header */}
          <div className="brutal-border mb-0">
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#000", color: "#C5F82A" }}>
              <span className="text-xs font-bold">&gt;_ STAG.IO v1.0.0</span>
              <span className="ml-auto text-xs opacity-50">session: active</span>
            </div>
          </div>

          {/* Main content area */}
          <div className="brutal-border border-t-0 p-8 lg:p-12" style={{ background: "#FAFAF2" }}>
            <div className="mb-4 flex items-center gap-2 text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>
              <Code className="h-3 w-3" />
              <span>&gt; stag.io --init --mode=discover</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6"
              style={{ textWrap: "balance" }}>
              YOUR NEXT<br />
              INTERNSHIP.<br />
              <span className="cursor-blink" style={{ color: "#C5F82A", WebkitTextStroke: "2px #000" }}>
                ONE COMMAND AWAY
              </span>
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-10"
              style={{ borderTop: "2px solid #000", paddingTop: "1.5rem" }}>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.6)" }}>
                No more bureaucracy. No more paper trails. Stag.io connects students
                with companies through skill-based matching and automates the entire
                internship agreement workflow.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: "#C5F82A", background: "#000", padding: "1px 6px" }}>OK</span>
                  <span>Skill-based smart matching</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: "#C5F82A", background: "#000", padding: "1px 6px" }}>OK</span>
                  <span>Auto-generated Convention de Stage</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: "#C5F82A", background: "#000", padding: "1px 6px" }}>OK</span>
                  <span>Real-time placement analytics</span>
                </div>
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group brutal-border flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-150 focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
                style={{ background: "#C5F82A" }}
                aria-label="Start finding internships">
                &gt; FIND INTERNSHIPS
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-2" />
              </button>
              <button className="group brutal-border flex items-center justify-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-150 hover:bg-[#000] hover:text-[#C5F82A] focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:outline-none"
                aria-label="Post an internship offer">
                &gt; POST AN OFFER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-0">
          {[
            {
              icon: Search,
              tag: "MODULE::STUDENT",
              title: "SEARCH & APPLY",
              desc: "Filter by wilaya, tech stack, internship type. Build a digital CV with skill tags and GitHub links.",
              accent: "#C5F82A",
            },
            {
              icon: Shield,
              tag: "MODULE::COMPANY",
              title: "RECRUIT & MANAGE",
              desc: "Create company profile. Publish offers, track applications, accept candidates to trigger workflows.",
              accent: "#FF3D00",
            },
            {
              icon: FileText,
              tag: "MODULE::ADMIN",
              title: "VALIDATE & GENERATE",
              desc: "Validate internship placements. Auto-generate pre-filled Convention de Stage PDFs. View global stats.",
              accent: "#00B0FF",
            },
          ].map((feat, i) => (
            <div key={i} className="brutal-border p-6 transition-all duration-150 cursor-pointer hover-invert"
              style={{ marginLeft: i > 0 ? "-3px" : 0 }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold tracking-wider px-2 py-1"
                  style={{ background: feat.accent, color: feat.accent === "#C5F82A" ? "#000" : "#FFF" }}>
                  {feat.tag}
                </span>
                <feat.icon className="h-5 w-5 opacity-40" />
              </div>
              <h3 className="text-lg font-bold mb-3 tracking-tight">{feat.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "inherit", opacity: 0.6 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS ROW --- */}
      <section className="px-6 lg:px-12 pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="brutal-border flex flex-col md:flex-row" style={{ background: "#000", color: "#C5F82A" }}>
            {[
              { value: "2,500+", label: "STUDENTS" },
              { value: "350+", label: "COMPANIES" },
              { value: "45", label: "UNIVERSITIES" },
              { value: "96%", label: "PLACED" },
            ].map((stat, i) => (
              <div key={i} className="flex-1 p-6 text-center"
                style={{ borderRight: i < 3 ? "2px solid #C5F82A" : "none" }}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-[10px] font-bold tracking-[0.2em]" style={{ color: "rgba(197,248,42,0.5)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
