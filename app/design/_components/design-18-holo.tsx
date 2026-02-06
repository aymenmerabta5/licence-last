"use client";

import { Urbanist } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Gem, Sparkles, Star } from "lucide-react";

const urbanist = Urbanist({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export function DesignHolo() {
  return (
    <div className={urbanist.className} style={{ background: "#09090B", color: "#FAFAFA", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes holo-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes holo-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes holo-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes holo-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes foil-pulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
        .holo-gradient {
          background: linear-gradient(135deg, #FF6EC7, #FFD700, #00FF88, #00BFFF, #FF6EC7, #FFD700);
          background-size: 300% 300%;
          animation: holo-shift 6s ease-in-out infinite;
        }
        .holo-text {
          background: linear-gradient(90deg, #FF6EC7 0%, #FFD700 20%, #00FF88 40%, #00BFFF 60%, #FF6EC7 80%, #FFD700 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: holo-shimmer 3s linear infinite;
        }
        .holo-border {
          position: relative;
          border: 1px solid rgba(255,255,255,0.06);
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .holo-border::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(255,110,199,0.2), rgba(255,215,0,0.2), rgba(0,255,136,0.2), rgba(0,191,255,0.2));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .holo-border:hover::before { opacity: 1; }
        .holo-border:hover {
          border-color: transparent;
          transform: translateY(-4px);
        }
        .holo-in { animation: holo-fade 0.6s ease-out both; }
        .holo-in-2 { animation: holo-fade 0.6s ease-out 0.1s both; }
        .holo-in-3 { animation: holo-fade 0.6s ease-out 0.2s both; }
        .holo-in-4 { animation: holo-fade 0.6s ease-out 0.3s both; }
        .holo-in-5 { animation: holo-fade 0.6s ease-out 0.4s both; }
        .holo-ring { animation: holo-rotate 15s linear infinite; }
        .foil-bg { animation: foil-pulse 4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .holo-gradient, .holo-text, .holo-in, .holo-in-2, .holo-in-3, .holo-in-4,
          .holo-in-5, .holo-ring, .foil-bg, .holo-shimmer {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .holo-text { -webkit-text-fill-color: #FF6EC7; background: none; }
        }
      `}</style>

      {/* Holographic foil background shimmer */}
      <div className="foil-bg fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 holo-gradient" style={{ opacity: 0.04 }} />
      </div>

      {/* Decorative rotating ring */}
      <div className="fixed pointer-events-none" aria-hidden="true"
        style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
        <svg className="holo-ring" width="800" height="800" viewBox="0 0 800 800" fill="none" style={{ opacity: 0.03 }}>
          <circle cx="400" cy="400" r="380" stroke="url(#holoGrad)" strokeWidth="1" fill="none" />
          <circle cx="400" cy="400" r="340" stroke="url(#holoGrad)" strokeWidth="0.5" fill="none" strokeDasharray="8 12" />
          <defs>
            <linearGradient id="holoGrad" x1="0" y1="0" x2="800" y2="800">
              <stop offset="0%" stopColor="#FF6EC7" />
              <stop offset="25%" stopColor="#FFD700" />
              <stop offset="50%" stopColor="#00FF88" />
              <stop offset="75%" stopColor="#00BFFF" />
              <stop offset="100%" stopColor="#FF6EC7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <Gem className="h-5 w-5 holo-text" style={{ WebkitTextFillColor: "unset", color: "#FF6EC7" }} />
          <span className="text-xl font-bold tracking-tight">Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Platform", "Students", "Companies", "Premium"].map((item) => (
            <span key={item} className="text-xs font-medium tracking-wide cursor-pointer transition-colors duration-300"
              style={{ color: "rgba(250,250,250,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FAFAFA")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(250,250,250,0.3)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="holo-gradient rounded-full px-6 py-2.5 text-xs font-bold tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,110,199,0.2)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
          style={{ color: "#09090B" }}
          aria-label="Get exclusive access">
          Get Access
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-20 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          {/* Premium badge */}
          <div className="holo-in inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8"
            style={{ border: "1px solid rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.03)" }}>
            <Star className="h-3 w-3" style={{ color: "#FFD700" }} aria-hidden="true" />
            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#FFD700" }}>
              Premium Experience
            </span>
          </div>

          <h1 className="holo-in-2 text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[1.02] tracking-tight mb-6"
            style={{ textWrap: "balance" }}>
            The Future is{" "}
            <span className="holo-text">Iridescent</span>
          </h1>

          <p className="holo-in-3 mx-auto max-w-lg text-base font-light leading-relaxed mb-12"
            style={{ color: "rgba(250,250,250,0.4)" }}>
            A premium platform where university talent meets industry brilliance.
            Skill-based matching that shines, documents that generate themselves,
            and placement tracking that dazzles.
          </p>

          {/* CTAs */}
          <div className="holo-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button className="group holo-gradient flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,110,199,0.2)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ color: "#09090B" }}
              aria-label="Start your premium experience">
              Enter Experience
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-2 rounded-full border px-8 py-4 text-sm font-medium transition-all duration-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
              style={{ borderColor: "rgba(250,250,250,0.1)", color: "rgba(250,250,250,0.6)" }}
              aria-label="Post a premium offer">
              Post Offer
            </button>
          </div>

          {/* Feature cards with holographic borders */}
          <div className="holo-in-5 grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: "Radiant Profiles", desc: "Digital CV with holographic skill tags, GitHub integration, and portfolio showcase. Let your expertise refract.", color: "#FF6EC7" },
              { icon: Building2, title: "Prismatic Portal", desc: "Company showcase with chromatic offer management. Track candidates through every spectrum of the pipeline.", color: "#FFD700" },
              { icon: FileText, title: "Crystal Docs", desc: "Auto-generated Convention de Stage with precision clarity. Validated placements, transparent analytics.", color: "#00FF88" },
            ].map((feat, i) => (
              <div key={i} className="holo-border rounded-2xl p-7 text-left cursor-pointer"
                style={{ background: "rgba(250,250,250,0.02)" }}>
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${feat.color}10` }}>
                  <feat.icon className="h-5 w-5" style={{ color: feat.color }} />
                </div>
                <h3 className="text-base font-bold mb-2">{feat.title}</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(250,250,250,0.35)" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl p-8" style={{ border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2.5K+", label: "Students", color: "#FF6EC7" },
              { value: "350+", label: "Companies", color: "#FFD700" },
              { value: "45", label: "Universities", color: "#00FF88" },
              { value: "96%", label: "Placed", color: "#00BFFF" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1" style={{ color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div className="text-[10px] font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(250,250,250,0.2)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
