"use client";

import { Manrope } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText } from "lucide-react";

const manrope = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export function DesignBauhaus() {
  return (
    <div className={manrope.className} style={{ background: "#FFFDF5", color: "#1A1A1A", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes bh-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bh-pop {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bh-slide {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .bh-in { animation: bh-slide 0.5s ease-out both; }
        .bh-in-2 { animation: bh-slide 0.5s ease-out 0.08s both; }
        .bh-in-3 { animation: bh-slide 0.5s ease-out 0.16s both; }
        .bh-in-4 { animation: bh-slide 0.5s ease-out 0.24s both; }
        .bh-in-5 { animation: bh-pop 0.5s ease-out 0.3s both; }
        .bh-rotate { animation: bh-spin 30s linear infinite; }
        .bh-card {
          border: 3px solid #1A1A1A;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bh-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: 6px 6px 0 #1A1A1A;
        }
        @media (prefers-reduced-motion: reduce) {
          .bh-in, .bh-in-2, .bh-in-3, .bh-in-4, .bh-in-5, .bh-rotate {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Geometric background shapes */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Large red circle */}
        <div className="absolute rounded-full" style={{ top: "-8%", right: "-5%", width: "400px", height: "400px", background: "#E63946", opacity: 0.08 }} />
        {/* Blue triangle (CSS) */}
        <div className="absolute" style={{ bottom: "10%", left: "5%", width: 0, height: 0, borderLeft: "120px solid transparent", borderRight: "120px solid transparent", borderBottom: "200px solid rgba(30,80,162,0.06)" }} />
        {/* Yellow rectangle */}
        <div className="absolute" style={{ top: "40%", right: "8%", width: "80px", height: "200px", background: "#F4B942", opacity: 0.06, transform: "rotate(15deg)" }} />
        {/* Rotating circle outline */}
        <div className="bh-rotate absolute" style={{ bottom: "30%", right: "25%", width: "200px", height: "200px", border: "3px solid rgba(30,80,162,0.06)", borderRadius: "50%" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5"
        style={{ borderBottom: "3px solid #1A1A1A" }}>
        <div className="flex items-center gap-3">
          {/* Bauhaus logo: overlapping circle + triangle + square */}
          <div className="relative h-8 w-8">
            <div className="absolute top-0 left-0 h-5 w-5 rounded-full" style={{ background: "#E63946" }} />
            <div className="absolute bottom-0 right-0 h-4 w-4" style={{ background: "#F4B942" }} />
          </div>
          <span className="text-lg font-extrabold tracking-tight uppercase">STAG.IO</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Form", "Function", "Material", "Process"].map((item) => (
            <span key={item} className="text-xs font-bold uppercase tracking-[0.12em] cursor-pointer transition-colors duration-200 hover:text-[#E63946]"
              style={{ color: "rgba(26,26,26,0.35)" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#1A1A1A] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          style={{ background: "#E63946" }}
          aria-label="Enter the platform">
          ENTER
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: geometric composition */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[400px] bh-in-5">
            {/* Red circle */}
            <div className="absolute rounded-full" style={{ width: "240px", height: "240px", background: "#E63946", top: "5%", left: "5%" }} />
            {/* Blue triangle (overlapping) */}
            <div className="absolute" style={{
              width: 0, height: 0,
              borderLeft: "100px solid transparent", borderRight: "100px solid transparent", borderBottom: "170px solid #1E50A2",
              bottom: "8%", right: "10%",
            }} />
            {/* Yellow rectangle (overlapping) */}
            <div className="absolute" style={{ width: "120px", height: "160px", background: "#F4B942", top: "30%", left: "35%" }} />
            {/* Black circle outline */}
            <div className="absolute rounded-full" style={{ width: "140px", height: "140px", border: "4px solid #1A1A1A", bottom: "20%", left: "15%" }} />
          </div>

          {/* Right: text */}
          <div className="lg:col-span-7">
            <div className="bh-in flex items-center gap-2 mb-6">
              <div className="h-3 w-3 rounded-full" style={{ background: "#E63946" }} />
              <div className="h-3 w-3" style={{ background: "#F4B942" }} />
              <div className="h-3 w-3" style={{ background: "#1E50A2", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(26,26,26,0.3)" }}>
                FORM FOLLOWS FUNCTION
              </span>
            </div>

            <h1 className="bh-in-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight uppercase mb-6"
              style={{ textWrap: "balance" }}>
              LESS IS{" "}
              <span style={{ color: "#E63946" }}>MORE</span>
              <br />
              <span style={{ color: "#1E50A2" }}>PLACEMENT</span>
            </h1>

            <p className="bh-in-3 max-w-md text-sm font-medium leading-relaxed mb-8" style={{ color: "rgba(26,26,26,0.45)" }}>
              A platform designed with Bauhaus principles: form follows function.
              Pure utility. Skill-based matching. Automated workflows.
              Nothing superfluous. Everything essential.
            </p>

            <div className="bh-in-4 flex flex-col sm:flex-row items-start gap-4">
              <button className="group bh-card flex items-center gap-3 px-8 py-4 text-xs font-extrabold uppercase tracking-[0.1em] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                style={{ background: "#F4B942", color: "#1A1A1A" }}
                aria-label="Explore the platform">
                EXPLORE
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button className="group bh-card flex items-center gap-3 px-8 py-4 text-xs font-extrabold uppercase tracking-[0.1em] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
                style={{ background: "#FFFDF5", color: "#1A1A1A" }}
                aria-label="Post an offer">
                POST OFFER
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-0">
          {[
            { icon: GraduationCap, title: "STUDENT", desc: "Build profile. Tag skills. Connect repositories. Search. Apply. Essential functions, zero friction.", bg: "#E63946", color: "#FFF" },
            { icon: Building2, title: "COMPANY", desc: "Publish offers. Review candidates. Accept talent. Trigger workflow. Every action purposeful.", bg: "#F4B942", color: "#1A1A1A" },
            { icon: FileText, title: "ADMIN", desc: "Validate placements. Generate documents. Monitor statistics. Pure administrative function.", bg: "#1E50A2", color: "#FFF" },
          ].map((feat, i) => (
            <div key={i} className="bh-in-5 p-8" style={{ background: feat.bg, color: feat.color, border: "3px solid #1A1A1A", marginLeft: i > 0 ? "-3px" : 0 }}>
              <feat.icon className="h-6 w-6 mb-6" />
              <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-3">{feat.title}</h3>
              <p className="text-xs leading-relaxed font-medium" style={{ opacity: 0.7 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-5xl" style={{ border: "3px solid #1A1A1A" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "2,500+", label: "STUDENTS", bg: "#FFFDF5" },
              { value: "350+", label: "COMPANIES", bg: "rgba(228,57,70,0.05)" },
              { value: "45", label: "UNIVERSITIES", bg: "rgba(244,185,66,0.05)" },
              { value: "96%", label: "PLACED", bg: "rgba(30,80,162,0.05)" },
            ].map((s, i) => (
              <div key={i} className="p-6 text-center" style={{ background: s.bg, borderRight: i < 3 ? "3px solid #1A1A1A" : "none" }}>
                <div className="text-3xl font-extrabold mb-1">{s.value}</div>
                <div className="text-[9px] font-bold tracking-[0.2em]" style={{ color: "rgba(26,26,26,0.3)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
