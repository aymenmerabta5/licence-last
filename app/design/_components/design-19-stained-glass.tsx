"use client";

import { Cinzel, EB_Garamond } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Church, Sparkles } from "lucide-react";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });
const garamond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export function DesignStainedGlass() {
  return (
    <div className={garamond.className} style={{ background: "#110D14", color: "#E8DFD0", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes glass-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.15); }
        }
        @keyframes light-ray {
          0%, 100% { opacity: 0.02; transform: translateY(0) scaleY(1); }
          50% { opacity: 0.06; transform: translateY(-10px) scaleY(1.05); }
        }
        @keyframes sg-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sg-in { animation: sg-fade 0.8s ease-out both; }
        .sg-in-2 { animation: sg-fade 0.8s ease-out 0.12s both; }
        .sg-in-3 { animation: sg-fade 0.8s ease-out 0.24s both; }
        .sg-in-4 { animation: sg-fade 0.8s ease-out 0.36s both; }
        .sg-in-5 { animation: sg-fade 0.8s ease-out 0.48s both; }
        .glass-panel { animation: glass-glow 5s ease-in-out infinite; }
        .light-beam { animation: light-ray 6s ease-in-out infinite; }
        .glass-card {
          border: 2px solid rgba(232,223,208,0.08);
          transition: border-color 0.5s ease, box-shadow 0.5s ease, transform 0.4s ease;
        }
        .glass-card:hover {
          border-color: rgba(232,223,208,0.2);
          box-shadow: inset 0 0 30px rgba(232,223,208,0.03);
          transform: translateY(-4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .sg-in, .sg-in-2, .sg-in-3, .sg-in-4, .sg-in-5, .glass-panel, .light-beam {
            animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important;
          }
        }
      `}</style>

      {/* Stained glass window background */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center" aria-hidden="true">
        <svg className="glass-panel" width="900" height="900" viewBox="0 0 900 900" style={{ opacity: 0.12 }}>
          {/* Rose window — concentric geometric arcs */}
          <defs>
            <radialGradient id="sgRuby"><stop offset="0%" stopColor="#9B1B30" /><stop offset="100%" stopColor="#5A0F1E" /></radialGradient>
            <radialGradient id="sgSapphire"><stop offset="0%" stopColor="#1B4D9B" /><stop offset="100%" stopColor="#0F2A5A" /></radialGradient>
            <radialGradient id="sgEmerald"><stop offset="0%" stopColor="#1B7A3D" /><stop offset="100%" stopColor="#0F4A24" /></radialGradient>
            <radialGradient id="sgAmber"><stop offset="0%" stopColor="#C9891E" /><stop offset="100%" stopColor="#7A5212" /></radialGradient>
          </defs>
          {/* Outer ring petals */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const cx = 450 + Math.cos(angle) * 320;
            const cy = 450 + Math.sin(angle) * 320;
            const fills = ["url(#sgRuby)", "url(#sgSapphire)", "url(#sgEmerald)", "url(#sgAmber)"];
            return <circle key={`o${i}`} cx={cx} cy={cy} r="60" fill={fills[i % 4]} opacity="0.7" />;
          })}
          {/* Inner ring */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = ((i * 45 + 22.5) * Math.PI) / 180;
            const cx = 450 + Math.cos(angle) * 180;
            const cy = 450 + Math.sin(angle) * 180;
            const fills = ["url(#sgAmber)", "url(#sgRuby)", "url(#sgSapphire)", "url(#sgEmerald)"];
            return <circle key={`i${i}`} cx={cx} cy={cy} r="45" fill={fills[i % 4]} opacity="0.6" />;
          })}
          {/* Center */}
          <circle cx="450" cy="450" r="70" fill="url(#sgAmber)" opacity="0.8" />
          <circle cx="450" cy="450" r="30" fill="url(#sgRuby)" opacity="0.9" />
          {/* Lead lines (dark borders between glass) */}
          <circle cx="450" cy="450" r="320" stroke="#110D14" strokeWidth="4" fill="none" />
          <circle cx="450" cy="450" r="180" stroke="#110D14" strokeWidth="3" fill="none" />
          <circle cx="450" cy="450" r="70" stroke="#110D14" strokeWidth="3" fill="none" />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return <line key={`l${i}`} x1={450 + Math.cos(angle) * 70} y1={450 + Math.sin(angle) * 70}
              x2={450 + Math.cos(angle) * 390} y2={450 + Math.sin(angle) * 390} stroke="#110D14" strokeWidth="2" />;
          })}
        </svg>
      </div>

      {/* Light rays from above */}
      <div className="light-beam fixed top-0 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true"
        style={{ width: "600px", height: "100%", background: "linear-gradient(to bottom, rgba(201,137,30,0.06), transparent 60%)" }} />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-10 lg:px-20 pt-6 pb-6"
        style={{ borderBottom: "1px solid rgba(232,223,208,0.06)" }}>
        <div className="flex items-center gap-3">
          <Church className="h-4 w-4" style={{ color: "#C9891E" }} />
          <span className={`${cinzel.className} text-lg tracking-[0.15em] uppercase`} style={{ fontWeight: 500 }}>
            Stag.io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Sanctum", "Scholars", "Guilds", "Archive"].map((item) => (
            <span key={item} className={`${cinzel.className} text-[10px] tracking-[0.2em] uppercase cursor-pointer transition-colors duration-500`}
              style={{ color: "rgba(232,223,208,0.25)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C9891E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,223,208,0.25)")}>
              {item}
            </span>
          ))}
        </div>
        <button className={`${cinzel.className} border px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 hover:bg-[#C9891E] hover:text-[#110D14] hover:border-[#C9891E] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none`}
          style={{ borderColor: "rgba(201,137,30,0.3)", color: "#C9891E" }}
          aria-label="Enter the Stag.io sanctum">
          Enter
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-10 lg:px-20 pt-24 pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="sg-in flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(201,137,30,0.3))" }} />
            <Sparkles className="h-4 w-4" style={{ color: "#C9891E" }} aria-hidden="true" />
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, rgba(201,137,30,0.3))" }} />
          </div>

          <h1 className={`${cinzel.className} sg-in-2`}
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.1, fontWeight: 600, letterSpacing: "0.04em", textWrap: "balance" }}>
            Illuminating the{" "}
            <span style={{ color: "#9B1B30" }}>Path</span>{" "}
            to{" "}
            <span style={{ color: "#C9891E" }}>Purpose</span>
          </h1>

          {/* Decorative divider */}
          <div className="sg-in-3 flex items-center justify-center gap-3 my-10">
            <div className="h-px w-12" style={{ background: "rgba(155,27,48,0.3)" }} />
            <div className="h-2 w-2 rounded-full" style={{ background: "#C9891E", boxShadow: "0 0 10px rgba(201,137,30,0.4)" }} />
            <div className="h-px w-12" style={{ background: "rgba(27,77,155,0.3)" }} />
          </div>

          <p className="sg-in-3 mx-auto max-w-md text-base font-normal leading-[1.8] tracking-wide"
            style={{ color: "rgba(232,223,208,0.4)", fontStyle: "italic" }}>
            Like light through ancient glass, every student carries a spectrum of
            brilliance. We reveal the colours that connect scholars with their calling.
          </p>

          <div className="sg-in-4 mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
            <button className={`${cinzel.className} group flex items-center gap-3 px-8 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-500 hover:shadow-[0_0_30px_rgba(201,137,30,0.15)] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none`}
              style={{ background: "#C9891E", color: "#110D14", fontWeight: 600 }}
              aria-label="Begin your illumination">
              Illuminate
              <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
            </button>
            <button className={`${cinzel.className} group flex items-center gap-3 border px-8 py-3.5 text-xs tracking-[0.15em] uppercase transition-all duration-500 hover:bg-[rgba(155,27,48,0.08)] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none`}
              style={{ borderColor: "rgba(155,27,48,0.3)", color: "#9B1B30", fontWeight: 500 }}
              aria-label="Join as a guild partner">
              Join Guild
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES (three stained glass panels) --- */}
      <section className="relative z-10 px-10 lg:px-20 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: "The Scholar", desc: "Compose your digital identity with tagged virtues, repository scrolls, and portfolio illuminations. Seek with purpose.", color: "#9B1B30", glow: "rgba(155,27,48,0.06)" },
            { icon: Building2, title: "The Guild", desc: "Present your house. Commission apprenticeships, evaluate petitioners, and bestow acceptance upon the worthy.", color: "#1B4D9B", glow: "rgba(27,77,155,0.06)" },
            { icon: FileText, title: "The Seal", desc: "Validate sacred bonds. Forge official Convention de Stage documents. Observe the tapestry of placed scholars.", color: "#C9891E", glow: "rgba(201,137,30,0.06)" },
          ].map((feat, i) => (
            <div key={i} className="glass-card sg-in-5 p-8 text-center cursor-pointer"
              style={{ background: feat.glow }}>
              <feat.icon className="mx-auto h-6 w-6 mb-5" style={{ color: feat.color }} />
              <h3 className={`${cinzel.className} text-sm tracking-[0.15em] uppercase mb-3`} style={{ color: feat.color, fontWeight: 600 }}>
                {feat.title}
              </h3>
              <p className="text-sm leading-[1.8] font-normal" style={{ color: "rgba(232,223,208,0.4)", fontStyle: "italic" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-10 lg:px-20 pb-24">
        <div className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,500", label: "Scholars", color: "#9B1B30" },
            { value: "350", label: "Guilds", color: "#1B4D9B" },
            { value: "45", label: "Houses", color: "#1B7A3D" },
            { value: "96%", label: "Ordained", color: "#C9891E" },
          ].map((s, i) => (
            <div key={i} className="sg-in-5">
              <div className={`${cinzel.className} text-3xl mb-1`} style={{ color: s.color, fontWeight: 500 }}>{s.value}</div>
              <div className={`${cinzel.className} text-[9px] tracking-[0.25em] uppercase`} style={{ color: "rgba(232,223,208,0.2)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
