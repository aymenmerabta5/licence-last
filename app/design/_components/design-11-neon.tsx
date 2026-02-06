"use client";

import { Rajdhani } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Shield, Cpu, Binary } from "lucide-react";

const rajdhani = Rajdhani({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignNeon() {
  return (
    <div className={rajdhani.className} style={{ background: "#050508", color: "#E0E0E0", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes neon-glow-pink {
          0%, 100% { box-shadow: 0 0 5px #FF006E, 0 0 15px rgba(255,0,110,0.3); }
          50% { box-shadow: 0 0 10px #FF006E, 0 0 30px rgba(255,0,110,0.4), 0 0 60px rgba(255,0,110,0.1); }
        }
        @keyframes neon-glow-cyan {
          0%, 100% { box-shadow: 0 0 5px #00F5FF, 0 0 15px rgba(0,245,255,0.3); }
          50% { box-shadow: 0 0 10px #00F5FF, 0 0 30px rgba(0,245,255,0.4), 0 0 60px rgba(0,245,255,0.1); }
        }
        @keyframes glitch-text {
          0%, 100% { text-shadow: 2px 0 #FF006E, -2px 0 #00F5FF; }
          25% { text-shadow: -2px 0 #FF006E, 2px 0 #00F5FF; }
          50% { text-shadow: 2px 2px #FF006E, -2px -1px #00F5FF; }
          75% { text-shadow: -1px -2px #FF006E, 1px 2px #00F5FF; }
        }
        @keyframes data-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @keyframes cyber-reveal {
          from { opacity: 0; transform: translateX(-20px) skewX(-2deg); }
          to { opacity: 1; transform: translateX(0) skewX(0); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        .neon-pink { animation: neon-glow-pink 3s ease-in-out infinite; }
        .neon-cyan { animation: neon-glow-cyan 3s ease-in-out infinite 1.5s; }
        .glitch { animation: glitch-text 4s ease-in-out infinite; }
        .data-stream { animation: data-scroll 20s linear infinite; }
        .cyber-in { animation: cyber-reveal 0.5s ease-out both; }
        .cyber-in-2 { animation: cyber-reveal 0.5s ease-out 0.08s both; }
        .cyber-in-3 { animation: cyber-reveal 0.5s ease-out 0.16s both; }
        .cyber-in-4 { animation: cyber-reveal 0.5s ease-out 0.24s both; }
        .cyber-in-5 { animation: cyber-reveal 0.5s ease-out 0.32s both; }
        .grid-bg { animation: grid-pulse 4s ease-in-out infinite; }
        .neon-border-card {
          border: 1px solid rgba(255,0,110,0.15);
          transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .neon-border-card:hover {
          border-color: rgba(255,0,110,0.5);
          box-shadow: 0 0 20px rgba(255,0,110,0.1), inset 0 0 20px rgba(255,0,110,0.03);
          transform: translateY(-3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-pink, .neon-cyan, .glitch, .data-stream, .cyber-in, .cyber-in-2,
          .cyber-in-3, .cyber-in-4, .cyber-in-5, .grid-bg {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .glitch { text-shadow: none !important; }
        }
      `}</style>

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Grid overlay */}
        <div className="grid-bg absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,245,255,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,245,255,0.07) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }} />

        {/* Data stream columns */}
        {[10, 30, 55, 78, 92].map((left, i) => (
          <div key={i} className="absolute top-0 bottom-0 overflow-hidden"
            style={{ left: `${left}%`, width: "1px", opacity: 0.04 }}>
            <div className="data-stream" style={{ animationDuration: `${15 + i * 5}s` }}>
              <div className="text-[8px] leading-tight whitespace-nowrap" style={{ color: "#00F5FF" }}>
                {"01001 10110 00101 11010 01110 10001 ".repeat(40)}
              </div>
            </div>
          </div>
        ))}

        {/* Corner marks */}
        <div className="absolute top-8 left-8 w-8 h-8 border-t border-l" style={{ borderColor: "rgba(255,0,110,0.2)" }} />
        <div className="absolute top-8 right-8 w-8 h-8 border-t border-r" style={{ borderColor: "rgba(0,245,255,0.2)" }} />
        <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l" style={{ borderColor: "rgba(0,245,255,0.2)" }} />
        <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r" style={{ borderColor: "rgba(255,0,110,0.2)" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="neon-pink h-8 w-8 flex items-center justify-center"
            style={{ border: "1px solid #FF006E" }}>
            <Cpu className="h-4 w-4" style={{ color: "#FF006E" }} />
          </div>
          <span className="text-xl font-bold tracking-[0.1em] uppercase"
            style={{ color: "#FF006E", textShadow: "0 0 10px rgba(255,0,110,0.3)" }}>
            STAG.IO
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["SYS://PLATFORM", "USR://STUDENTS", "NET://COMPANIES", "DOC://INFO"].map((item) => (
            <span key={item} className="text-[11px] font-medium tracking-wider cursor-pointer transition-colors duration-200"
              style={{ color: "rgba(224,224,224,0.25)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00F5FF";
                e.currentTarget.style.textShadow = "0 0 8px rgba(0,245,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(224,224,224,0.25)";
                e.currentTarget.style.textShadow = "none";
              }}>
              {item}
            </span>
          ))}
        </div>
        <button className="neon-cyan px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#00F5FF] hover:text-[#050508] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          style={{ border: "1px solid #00F5FF", color: "#00F5FF" }}
          aria-label="Access the Stag.io system">
          ACCESS
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-20 pb-28">
        <div className="mx-auto max-w-5xl">
          {/* System status line */}
          <div className="cyber-in flex items-center gap-3 mb-8">
            <div className="h-2 w-2" style={{ background: "#39FF14", boxShadow: "0 0 8px #39FF14" }} />
            <span className="text-[10px] font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(57,255,20,0.6)" }}>
              SYSTEM ONLINE — ALL NODES ACTIVE
            </span>
          </div>

          <h1 className="cyber-in-2 glitch"
            style={{
              fontSize: "clamp(3rem, 7vw, 6rem)",
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "0.03em",
              color: "#FFFFFF",
              textWrap: "balance",
            }}>
            HACK YOUR<br />
            <span style={{ color: "#FF006E" }}>CAREER</span>{" "}
            <span style={{ color: "#00F5FF" }}>PATH</span>
          </h1>

          <div className="cyber-in-3 mt-8 flex items-start gap-8">
            <div className="h-16 w-px ink-line-v" style={{ background: "linear-gradient(to bottom, #FF006E, transparent)" }} />
            <p className="max-w-md text-sm font-light leading-relaxed" style={{ color: "rgba(224,224,224,0.4)" }}>
              Neural-matched internship placement system. Skill-vector analysis,
              automated document synthesis, real-time placement telemetry.
              Break through the bureaucracy.
            </p>
          </div>

          <div className="cyber-in-4 mt-10 flex flex-col sm:flex-row items-start gap-4">
            <button className="group flex items-center gap-3 px-8 py-3.5 text-sm font-bold tracking-[0.1em] uppercase transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,0,110,0.3)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ background: "#FF006E", color: "#FFF" }}
              aria-label="Initialize the Stag.io system">
              INITIALIZE
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
            <button className="group flex items-center gap-3 px-8 py-3.5 text-sm font-bold tracking-[0.1em] uppercase transition-all duration-300 hover:bg-[#00F5FF]/10 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
              style={{ border: "1px solid rgba(0,245,255,0.3)", color: "#00F5FF" }}
              aria-label="View system documentation">
              VIEW DOCS
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, tag: "NODE::STUDENT", title: "SKILL VECTOR", desc: "Profile synthesis with tagged competencies, repository links, and multi-axis search across location, stack, and type.", color: "#FF006E" },
            { icon: Building2, tag: "NODE::COMPANY", title: "RECRUIT NET", desc: "Enterprise interface for opportunity publishing, candidate pipeline management, and acceptance protocol triggers.", color: "#00F5FF" },
            { icon: FileText, tag: "NODE::ADMIN", title: "DOC SYNTH", desc: "Placement validation engine. Auto-generates Convention de Stage documents. Real-time placement analytics dashboard.", color: "#39FF14" },
          ].map((feat, i) => (
            <div key={i} className="neon-border-card cyber-in-5 p-7 cursor-pointer"
              style={{ background: "rgba(255,255,255,0.01)" }}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[9px] font-bold tracking-[0.15em] px-2 py-1"
                  style={{ border: `1px solid ${feat.color}40`, color: feat.color }}>
                  {feat.tag}
                </span>
                <feat.icon className="h-4 w-4" style={{ color: `${feat.color}60` }} />
              </div>
              <h3 className="text-lg font-bold tracking-wider mb-3" style={{ color: feat.color }}>
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(224,224,224,0.35)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl p-6"
          style={{ border: "1px solid rgba(255,0,110,0.1)", background: "rgba(255,0,110,0.02)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2,500+", label: "NODES", color: "#FF006E" },
              { value: "350+", label: "NETWORKS", color: "#00F5FF" },
              { value: "45", label: "CLUSTERS", color: "#39FF14" },
              { value: "96%", label: "UPLINK", color: "#FF006E" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1" style={{ color: s.color, textShadow: `0 0 15px ${s.color}30` }}>
                  {s.value}
                </div>
                <div className="text-[9px] font-medium tracking-[0.2em]" style={{ color: "rgba(224,224,224,0.2)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
