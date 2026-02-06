"use client";

import { Sacramento, Barlow } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Power } from "lucide-react";

const sacramento = Sacramento({ subsets: ["latin"], weight: ["400"] });
const barlow = Barlow({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignNeonSign() {
  return (
    <div className={barlow.className} style={{ background: "#0A0A0A", color: "#E0E0E0", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes neon-flicker-warm {
          0%, 100% { opacity: 1; text-shadow: 0 0 10px #FF6B9D, 0 0 20px #FF6B9D, 0 0 40px #FF6B9D, 0 0 80px rgba(255,107,157,0.3); }
          92% { opacity: 1; }
          93% { opacity: 0.7; text-shadow: 0 0 5px #FF6B9D, 0 0 10px #FF6B9D; }
          94% { opacity: 1; text-shadow: 0 0 10px #FF6B9D, 0 0 20px #FF6B9D, 0 0 40px #FF6B9D, 0 0 80px rgba(255,107,157,0.3); }
          96% { opacity: 0.85; text-shadow: 0 0 7px #FF6B9D, 0 0 15px #FF6B9D; }
          97% { opacity: 1; }
        }
        @keyframes neon-breathe {
          0%, 100% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.1); }
        }
        @keyframes ns-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tube-hum {
          0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 15px currentColor, 0 0 30px rgba(255,107,157,0.2); }
          50% { box-shadow: 0 0 8px currentColor, 0 0 20px currentColor, 0 0 45px rgba(255,107,157,0.3); }
        }
        .neon-sign {
          animation: neon-flicker-warm 5s ease-in-out infinite;
          color: #FF6B9D;
        }
        .neon-breathe { animation: neon-breathe 3s ease-in-out infinite; }
        .tube-glow { animation: tube-hum 3s ease-in-out infinite; }
        .ns-in { animation: ns-fade 0.7s ease-out both; }
        .ns-in-2 { animation: ns-fade 0.7s ease-out 0.1s both; }
        .ns-in-3 { animation: ns-fade 0.7s ease-out 0.2s both; }
        .ns-in-4 { animation: ns-fade 0.7s ease-out 0.3s both; }
        .ns-in-5 { animation: ns-fade 0.7s ease-out 0.4s both; }
        .ns-card {
          border: 1px solid rgba(255,107,157,0.1);
          transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.3s ease;
        }
        .ns-card:hover {
          border-color: rgba(255,107,157,0.3);
          box-shadow: 0 0 20px rgba(255,107,157,0.05), inset 0 0 20px rgba(255,107,157,0.02);
          transform: translateY(-4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-sign, .neon-breathe, .tube-glow, .ns-in, .ns-in-2, .ns-in-3, .ns-in-4, .ns-in-5 {
            animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important;
          }
          .neon-sign { text-shadow: 0 0 10px #FF6B9D, 0 0 20px #FF6B9D; }
        }
      `}</style>

      {/* Brick wall texture (subtle) */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 29px,
              rgba(255,255,255,0.015) 29px,
              rgba(255,255,255,0.015) 30px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 59px,
              rgba(255,255,255,0.01) 59px,
              rgba(255,255,255,0.01) 60px
            )
          `,
        }} />

      {/* Wall glow from sign */}
      <div className="fixed pointer-events-none" aria-hidden="true"
        style={{
          top: "20%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "400px",
          background: "radial-gradient(ellipse, rgba(255,107,157,0.04), transparent 70%)",
        }} />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2">
          <Power className="h-4 w-4 tube-glow" style={{ color: "#FF6B9D" }} />
          <span className="text-base font-semibold tracking-wider uppercase" style={{ color: "rgba(224,224,224,0.5)" }}>
            Stag.io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Open", "Students", "Companies", "Hours"].map((item) => (
            <span key={item} className="text-xs font-medium tracking-wider uppercase cursor-pointer transition-colors duration-300"
              style={{ color: "rgba(224,224,224,0.2)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FF6B9D";
                e.currentTarget.style.textShadow = "0 0 8px rgba(255,107,157,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(224,224,224,0.2)";
                e.currentTarget.style.textShadow = "none";
              }}>
              {item}
            </span>
          ))}
        </div>
        <button className="border px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-400 hover:bg-[#FF6B9D] hover:text-[#0A0A0A] hover:border-[#FF6B9D] hover:shadow-[0_0_20px_rgba(255,107,157,0.3)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
          style={{ borderColor: "rgba(255,107,157,0.3)", color: "#FF6B9D" }}
          aria-label="Walk in to Stag.io">
          WALK IN
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-24 pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="ns-in mb-4">
            <span className="text-[10px] font-medium tracking-[0.3em] uppercase" style={{ color: "rgba(224,224,224,0.15)" }}>
              NOW OPEN
            </span>
          </div>

          {/* The neon sign headline */}
          <h1 className={`${sacramento.className} neon-sign ns-in-2`}
            style={{ fontSize: "clamp(4rem, 10vw, 9rem)", lineHeight: 0.95, letterSpacing: "0.02em" }}>
            Find Your<br />Internship
          </h1>

          {/* Subtitle in contrasting sans */}
          <p className="ns-in-3 mt-8 text-sm font-light tracking-[0.1em] uppercase"
            style={{ color: "rgba(224,224,224,0.25)" }}>
            Skill-based matching &bull; Automated documents &bull; Real-time tracking
          </p>

          <div className="ns-in-4 mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="group flex items-center gap-3 px-8 py-3.5 text-sm font-semibold tracking-wider uppercase transition-all duration-400 hover:shadow-[0_0_40px_rgba(255,107,157,0.2)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ background: "#FF6B9D", color: "#0A0A0A" }}
              aria-label="Come inside Stag.io">
              COME IN
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </button>
            <button className="group flex items-center gap-3 border px-8 py-3.5 text-sm font-medium tracking-wider uppercase transition-all duration-400 hover:bg-[rgba(255,107,157,0.05)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ borderColor: "rgba(224,224,224,0.1)", color: "rgba(224,224,224,0.4)" }}
              aria-label="Post a job">
              HIRING?
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: "Students", desc: "Build your digital profile. Tag your skills, link your repos. Search the board for the perfect placement.", color: "#FF6B9D" },
            { icon: Building2, title: "Companies", desc: "Post your openings. Review who walks through the door. Accept the right fit with a handshake.", color: "#FFB86C" },
            { icon: FileText, title: "Admin", desc: "Validate the match. Generate the paperwork. Watch the numbers on the wall add up.", color: "#50FA7B" },
          ].map((feat, i) => (
            <div key={i} className="ns-card ns-in-5 p-7 cursor-pointer" style={{ background: "rgba(255,255,255,0.01)" }}>
              <feat.icon className="h-5 w-5 mb-5 tube-glow" style={{ color: feat.color }} />
              <h3 className="text-base font-semibold tracking-wider uppercase mb-3" style={{ color: feat.color }}>
                {feat.title}
              </h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(224,224,224,0.3)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2.5K+", label: "Visitors", color: "#FF6B9D" },
            { value: "350+", label: "Venues", color: "#FFB86C" },
            { value: "45", label: "Districts", color: "#50FA7B" },
            { value: "96%", label: "Matched", color: "#FF6B9D" },
          ].map((s, i) => (
            <div key={i} className="ns-in-5">
              <div className="text-3xl font-bold mb-1 neon-breathe" style={{ color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
              <div className="text-[9px] font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(224,224,224,0.15)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
