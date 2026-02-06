"use client";

import { Orbitron, Poppins } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Zap, ChevronRight } from "lucide-react";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export function DesignSynthwave() {
  return (
    <div className={poppins.className} style={{ background: "#0a0015", color: "#F0E6FF", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes sun-pulse {
          0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.8; }
          50% { transform: translateX(-50%) scale(1.03); opacity: 1; }
        }
        @keyframes grid-scroll {
          from { transform: perspective(400px) rotateX(60deg) translateY(0); }
          to { transform: perspective(400px) rotateX(60deg) translateY(50px); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes synth-reveal {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.6; }
          94% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
        }
        @keyframes chrome-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .sun-glow { animation: sun-pulse 4s ease-in-out infinite; }
        .grid-flow { animation: grid-scroll 3s linear infinite; }
        .scan-line {
          animation: scanline 8s linear infinite;
          background: linear-gradient(transparent 0%, rgba(255,45,149,0.03) 50%, transparent 100%);
          height: 200%;
        }
        .syn-in { animation: synth-reveal 0.6s ease-out both; }
        .syn-in-2 { animation: synth-reveal 0.6s ease-out 0.1s both; }
        .syn-in-3 { animation: synth-reveal 0.6s ease-out 0.2s both; }
        .syn-in-4 { animation: synth-reveal 0.6s ease-out 0.3s both; }
        .syn-in-5 { animation: synth-reveal 0.6s ease-out 0.4s both; }
        .neon-text { animation: neon-flicker 5s ease-in-out infinite; }
        .chrome {
          background: linear-gradient(90deg, #FF2D95 0%, #FFD700 25%, #FF2D95 50%, #00E5FF 75%, #FF2D95 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: chrome-shine 4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sun-glow, .grid-flow, .scan-line, .syn-in, .syn-in-2, .syn-in-3,
          .syn-in-4, .syn-in-5, .neon-text, .chrome {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .chrome { -webkit-text-fill-color: #FF2D95; background: none; }
        }
      `}</style>

      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Gradient sky */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, #0a0015 0%, #1a0533 30%, #2d0a4e 50%, #0a0015 100%)" }} />

        {/* Sun */}
        <div className="sun-glow absolute bottom-[35%] left-1/2 w-[300px] h-[150px] rounded-t-full"
          style={{
            background: "linear-gradient(to top, #FF6B35 0%, #FF2D95 40%, #FF2D95 60%, transparent 100%)",
            transform: "translateX(-50%)",
            filter: "blur(2px)",
          }} />
        {/* Sun horizontal lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="absolute left-1/2 w-[320px] h-[6px]"
            style={{
              bottom: `calc(35% + ${i * 25 + 15}px)`,
              transform: "translateX(-50%)",
              background: "#0a0015",
              opacity: 0.7,
            }} />
        ))}

        {/* Perspective grid floor */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] overflow-hidden"
          style={{ perspective: "400px" }}>
          <div className="grid-flow absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,45,149,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,45,149,0.15) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              transformOrigin: "center top",
              transform: "perspective(400px) rotateX(60deg)",
            }} />
        </div>

        {/* Scanline overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-50">
          <div className="scan-line absolute inset-x-0" />
        </div>
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" style={{ color: "#FF2D95" }} />
          <span className={`${orbitron.className} text-lg font-bold tracking-wider`}
            style={{ color: "#FF2D95", textShadow: "0 0 20px rgba(255,45,149,0.5)" }}>
            STAG.IO
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Students", "Companies", "Connect"].map((item) => (
            <span key={item} className={`${orbitron.className} text-[10px] font-medium tracking-[0.15em] uppercase cursor-pointer transition-colors duration-300`}
              style={{ color: "rgba(240,230,255,0.35)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#00E5FF";
                e.currentTarget.style.textShadow = "0 0 12px rgba(0,229,255,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(240,230,255,0.35)";
                e.currentTarget.style.textShadow = "none";
              }}>
              {item}
            </span>
          ))}
        </div>
        <button className={`${orbitron.className} neon-text rounded-none border px-5 py-2.5 text-[10px] font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-[#FF2D95] hover:text-white hover:shadow-[0_0_30px_rgba(255,45,149,0.4)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none`}
          style={{ borderColor: "#FF2D95", color: "#FF2D95" }}
          aria-label="Enter the Stag.io platform">
          ENTER
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="syn-in flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, #FF2D95)" }} />
            <span className={`${orbitron.className} text-[10px] font-medium tracking-[0.25em] uppercase`}
              style={{ color: "#00E5FF" }}>
              UNIVERSITY × ENTERPRISE
            </span>
            <div className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, #00E5FF)" }} />
          </div>

          <h1 className={`${orbitron.className} syn-in-2`}
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              lineHeight: 1.1,
              fontWeight: 900,
              letterSpacing: "0.04em",
              textWrap: "balance",
            }}>
            THE FUTURE OF{" "}
            <span className="chrome block mt-2">CAREER PLACEMENT</span>
          </h1>

          <p className="syn-in-3 mx-auto max-w-md mt-8 text-sm font-light leading-relaxed"
            style={{ color: "rgba(240,230,255,0.45)" }}>
            Skill-based matching, automated internship agreements, and real-time
            placement tracking. All on one retro-futuristic platform.
          </p>

          <div className="syn-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button className={`${orbitron.className} group flex items-center gap-3 px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,45,149,0.4)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none`}
              style={{
                background: "linear-gradient(135deg, #FF2D95, #FF6B35)",
                color: "#FFF",
              }}
              aria-label="Launch Stag.io">
              LAUNCH
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className={`${orbitron.className} group flex items-center gap-3 border px-8 py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-300 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`}
              style={{ borderColor: "rgba(0,229,255,0.3)", color: "#00E5FF" }}
              aria-label="Learn more about Stag.io">
              LEARN MORE
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, title: "STUDENT HUB", desc: "Digital CV with skill tags, GitHub links, and smart search by tech, location, and type.", color: "#FF2D95", glow: "rgba(255,45,149,0.15)" },
            { icon: Building2, title: "RECRUITER DECK", desc: "Publish offers, manage applications, accept candidates. Automated workflow triggers.", color: "#00E5FF", glow: "rgba(0,229,255,0.15)" },
            { icon: FileText, title: "ADMIN CONTROL", desc: "Validate placements, auto-generate Convention de Stage PDFs, view global statistics.", color: "#FFD700", glow: "rgba(255,215,0,0.15)" },
          ].map((feat, i) => (
            <div key={i} className="syn-in-5 p-7 transition-all duration-300 cursor-pointer hover:translate-y-[-4px]"
              style={{
                background: feat.glow,
                border: `1px solid ${feat.color}30`,
                boxShadow: `inset 0 1px 0 ${feat.color}15`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px ${feat.glow}, inset 0 1px 0 ${feat.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = `inset 0 1px 0 ${feat.color}15`;
              }}>
              <feat.icon className="h-6 w-6 mb-5" style={{ color: feat.color }} />
              <h3 className={`${orbitron.className} text-sm font-bold tracking-wider mb-3`}>{feat.title}</h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(240,230,255,0.45)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "2.5K+", label: "STUDENTS", color: "#FF2D95" },
            { value: "350+", label: "COMPANIES", color: "#00E5FF" },
            { value: "45", label: "UNIVERSITIES", color: "#FFD700" },
            { value: "96%", label: "PLACED", color: "#FF6B35" },
          ].map((s, i) => (
            <div key={i}>
              <div className={`${orbitron.className} text-3xl font-bold mb-1`}
                style={{ color: s.color, textShadow: `0 0 20px ${s.color}40` }}>
                {s.value}
              </div>
              <div className={`${orbitron.className} text-[9px] font-medium tracking-[0.2em]`}
                style={{ color: "rgba(240,230,255,0.3)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
