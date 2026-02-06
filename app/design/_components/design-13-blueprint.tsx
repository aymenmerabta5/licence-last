"use client";

import { IBM_Plex_Mono } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Ruler, PenTool, Crosshair } from "lucide-react";

const ibmMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignBlueprint() {
  return (
    <div className={ibmMono.className} style={{ background: "#1B3A5C", color: "#D4E4F7", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes bp-draw {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bp-line-h {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes bp-crosshair {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        .bp-in { animation: bp-draw 0.6s ease-out both; }
        .bp-in-2 { animation: bp-draw 0.6s ease-out 0.1s both; }
        .bp-in-3 { animation: bp-draw 0.6s ease-out 0.2s both; }
        .bp-in-4 { animation: bp-draw 0.6s ease-out 0.3s both; }
        .bp-in-5 { animation: bp-draw 0.6s ease-out 0.4s both; }
        .bp-line { transform-origin: left; animation: bp-line-h 0.8s ease-out 0.2s both; }
        .bp-cross { animation: bp-crosshair 3s ease-in-out infinite; }
        .bp-card {
          border: 1px solid rgba(212,228,247,0.12);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .bp-card:hover {
          border-color: rgba(212,228,247,0.3);
          background: rgba(212,228,247,0.04);
          transform: translateY(-3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .bp-in, .bp-in-2, .bp-in-3, .bp-in-4, .bp-in-5, .bp-line, .bp-cross {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Blueprint grid background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,228,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,228,247,0.04) 1px, transparent 1px),
            linear-gradient(rgba(212,228,247,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,228,247,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
        }} />

      {/* Corner registration marks */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {[{ t: "16px", l: "16px" }, { t: "16px", r: "16px" }, { b: "16px", l: "16px" }, { b: "16px", r: "16px" }].map((pos, i) => (
          <div key={i} className="bp-cross absolute" style={{ top: (pos as {t?:string}).t, bottom: (pos as {b?:string}).b, left: (pos as {l?:string}).l, right: (pos as {r?:string}).r }}>
            <Crosshair className="h-5 w-5" style={{ color: "rgba(212,228,247,0.15)" }} />
          </div>
        ))}
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(212,228,247,0.1)" }}>
        <div className="flex items-center gap-2.5">
          <Ruler className="h-4 w-4" style={{ color: "rgba(212,228,247,0.4)" }} />
          <span className="text-sm font-bold tracking-[0.15em] uppercase">STAG.IO</span>
          <span className="text-[9px] font-light tracking-wider ml-2" style={{ color: "rgba(212,228,247,0.25)" }}>
            REV 1.0
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["SPECS", "STUDENTS", "PARTNERS", "DOCS"].map((item) => (
            <span key={item} className="text-[10px] font-medium tracking-[0.15em] cursor-pointer transition-colors duration-200"
              style={{ color: "rgba(212,228,247,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(212,228,247,0.3)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="border px-4 py-2 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#D4E4F7] hover:text-[#1B3A5C] focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          style={{ borderColor: "rgba(212,228,247,0.3)", color: "#D4E4F7" }}
          aria-label="Access the platform">
          ACCESS
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Title block with dimension lines */}
          <div className="bp-in flex items-center gap-3 mb-4">
            <PenTool className="h-3 w-3" style={{ color: "rgba(212,228,247,0.3)" }} />
            <span className="text-[9px] font-medium tracking-[0.25em] uppercase" style={{ color: "rgba(212,228,247,0.3)" }}>
              SHEET 01 OF 01 &mdash; GENERAL ARRANGEMENT
            </span>
          </div>

          <h1 className="bp-in-2 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-2"
            style={{ color: "#FFFFFF", textWrap: "balance" }}>
            ENGINEERED{" "}
            <span style={{ color: "#7EB8E0", fontWeight: 300, fontStyle: "italic" }}>FOR</span>
            <br />PLACEMENT
          </h1>

          {/* Dimension annotation line */}
          <div className="bp-line bp-in-3 flex items-center gap-2 my-8">
            <div className="h-px flex-1 max-w-[200px]" style={{ background: "rgba(212,228,247,0.2)" }} />
            <span className="text-[9px] tracking-[0.2em]" style={{ color: "rgba(212,228,247,0.3)" }}>
              &larr; 2025 &mdash; PLATFORM SPEC &rarr;
            </span>
            <div className="h-px flex-1 max-w-[200px]" style={{ background: "rgba(212,228,247,0.2)" }} />
          </div>

          <div className="bp-in-3 grid md:grid-cols-2 gap-10 mb-10">
            <p className="text-sm font-light leading-relaxed" style={{ color: "rgba(212,228,247,0.45)" }}>
              A precision-engineered platform connecting university talent with industry.
              Skill-based matching algorithms, automated Convention de Stage generation,
              and real-time placement telemetry&mdash;architected for reliability.
            </p>
            <div className="flex flex-col gap-2">
              {["Skill-vector matching engine", "Automated document synthesis", "Multi-node placement tracking", "JWT-secured authentication"].map((spec, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="h-1.5 w-1.5" style={{ background: "#7EB8E0" }} />
                  <span style={{ color: "rgba(212,228,247,0.5)" }}>{spec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bp-in-4 flex flex-col sm:flex-row items-start gap-4">
            <button className="group flex items-center gap-3 px-7 py-3.5 text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,184,224,0.2)] focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
              style={{ background: "#7EB8E0", color: "#1B3A5C" }}
              aria-label="Deploy the platform">
              DEPLOY
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-3 border px-7 py-3.5 text-xs font-bold tracking-[0.12em] uppercase transition-all duration-300 hover:bg-[rgba(212,228,247,0.05)] focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
              style={{ borderColor: "rgba(212,228,247,0.2)", color: "#D4E4F7" }}
              aria-label="Review technical specs">
              VIEW SPECS
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, ref: "DWG-001", title: "STUDENT MODULE", desc: "Digital CV assembly. Skill tagging system. Repository integration. Multi-axis search by location, technology, and type.", color: "#7EB8E0" },
            { icon: Building2, ref: "DWG-002", title: "COMPANY MODULE", desc: "Enterprise profile configuration. Offer CRUD operations. Candidate pipeline visualization. Acceptance protocol triggers.", color: "#A8D5BA" },
            { icon: FileText, ref: "DWG-003", title: "ADMIN MODULE", desc: "Placement validation workflow. PDF document auto-generation. Convention de Stage templating. Statistical overview panel.", color: "#E8C97E" },
          ].map((feat, i) => (
            <div key={i} className="bp-card bp-in-5 p-7 relative">
              {/* Drawing reference number */}
              <div className="absolute top-3 right-3 text-[8px] font-bold tracking-wider" style={{ color: "rgba(212,228,247,0.2)" }}>
                {feat.ref}
              </div>
              <feat.icon className="h-5 w-5 mb-5" style={{ color: feat.color }} />
              <h3 className="text-sm font-bold tracking-[0.1em] mb-3" style={{ color: feat.color }}>{feat.title}</h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(212,228,247,0.4)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl p-6" style={{ border: "1px solid rgba(212,228,247,0.08)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px flex-1" style={{ background: "rgba(212,228,247,0.08)" }} />
            <span className="text-[8px] font-bold tracking-[0.2em]" style={{ color: "rgba(212,228,247,0.2)" }}>PERFORMANCE METRICS</span>
            <div className="h-px flex-1" style={{ background: "rgba(212,228,247,0.08)" }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2,500+", label: "STUDENTS", color: "#7EB8E0" },
              { value: "350+", label: "COMPANIES", color: "#A8D5BA" },
              { value: "45", label: "UNIVERSITIES", color: "#E8C97E" },
              { value: "96%", label: "PLACED", color: "#7EB8E0" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl font-bold mb-1" style={{ color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div className="text-[8px] font-medium tracking-[0.2em]" style={{ color: "rgba(212,228,247,0.2)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
