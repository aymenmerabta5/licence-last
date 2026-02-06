"use client";

import { Chivo } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Printer, Layers } from "lucide-react";

const chivo = Chivo({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export function DesignRiso() {
  return (
    <div className={chivo.className} style={{ background: "#F0EBE0", color: "#1A1A1A", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes riso-shift {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(1px, -1px); }
          50% { transform: translate(-1px, 1px); }
          75% { transform: translate(1px, 0px); }
        }
        @keyframes riso-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .riso-in { animation: riso-fade 0.5s ease-out both; }
        .riso-in-2 { animation: riso-fade 0.5s ease-out 0.08s both; }
        .riso-in-3 { animation: riso-fade 0.5s ease-out 0.16s both; }
        .riso-in-4 { animation: riso-fade 0.5s ease-out 0.24s both; }
        .riso-in-5 { animation: riso-fade 0.5s ease-out 0.32s both; }
        .riso-misregister {
          position: relative;
        }
        .riso-misregister::before {
          content: attr(data-text);
          position: absolute;
          left: 2px;
          top: 1px;
          color: #E63946;
          opacity: 0.4;
          z-index: -1;
          mix-blend-mode: multiply;
        }
        .riso-misregister::after {
          content: attr(data-text);
          position: absolute;
          left: -1px;
          top: -1px;
          color: #1E50A2;
          opacity: 0.3;
          z-index: -1;
          mix-blend-mode: multiply;
        }
        .riso-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .riso-card:hover {
          transform: translate(-3px, -3px) rotate(-0.5deg);
          box-shadow: 5px 5px 0 rgba(26,26,26,0.15);
        }
        /* Halftone dot pattern via CSS */
        .halftone {
          background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 4px 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .riso-in, .riso-in-2, .riso-in-3, .riso-in-4, .riso-in-5, .riso-shift {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.06]" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='r'%3E%3CfeTurbulence baseFrequency='0.8' numOctaves='4' type='fractalNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)'/%3E%3C/svg%3E")`,
        }} />

      {/* Background misregistered shapes */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {/* Red layer circle */}
        <div className="absolute rounded-full" style={{ top: "10%", right: "10%", width: "300px", height: "300px", background: "#E63946", opacity: 0.04, mixBlendMode: "multiply" }} />
        {/* Blue layer circle (shifted) */}
        <div className="absolute rounded-full" style={{ top: "12%", right: "11%", width: "300px", height: "300px", background: "#1E50A2", opacity: 0.04, mixBlendMode: "multiply" }} />
        {/* Yellow block */}
        <div className="absolute" style={{ bottom: "15%", left: "8%", width: "200px", height: "120px", background: "#F4B942", opacity: 0.05, mixBlendMode: "multiply", transform: "rotate(-5deg)" }} />
        {/* Red shifted block */}
        <div className="absolute" style={{ bottom: "16%", left: "9%", width: "200px", height: "120px", background: "#E63946", opacity: 0.03, mixBlendMode: "multiply", transform: "rotate(-4deg)" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5"
        style={{ borderBottom: "2px solid #1A1A1A" }}>
        <div className="flex items-center gap-2">
          <Printer className="h-4 w-4" style={{ color: "#E63946" }} />
          <span className="text-lg font-black tracking-tight uppercase">STAG.IO</span>
          <span className="text-[8px] font-bold tracking-wider ml-1 px-1.5 py-0.5"
            style={{ background: "#E63946", color: "#F0EBE0" }}>
            ZINE
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {["ISSUE 01", "CONTRIBUTORS", "SUBMIT", "DISTRO"].map((item) => (
            <span key={item} className="text-[10px] font-bold tracking-[0.1em] cursor-pointer transition-colors duration-200 hover:text-[#E63946]"
              style={{ color: "rgba(26,26,26,0.3)" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="px-4 py-2 text-[10px] font-black tracking-[0.1em] uppercase transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#E63946] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          style={{ background: "#1A1A1A", color: "#F0EBE0" }}
          aria-label="Subscribe to the zine">
          SUBSCRIBE
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-12 pb-16">
        <div className="mx-auto max-w-5xl">
          {/* Riso-style label */}
          <div className="riso-in flex items-center gap-3 mb-6">
            <Layers className="h-4 w-4" style={{ color: "#1E50A2" }} />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#1E50A2" }}>
              TWO-COLOR SPOT PRINT &bull; ISSUE 001
            </span>
          </div>

          {/* Misregistered headline */}
          <div className="riso-in-2 relative mb-2">
            <h1 className="riso-misregister text-6xl sm:text-7xl lg:text-[6.5rem] font-black leading-[0.9] tracking-tight uppercase"
              data-text="INTERN-SHIPS"
              style={{ color: "#1A1A1A" }}>
              INTERN&shy;SHIPS
            </h1>
          </div>
          <div className="riso-in-2 relative">
            <h1 className="riso-misregister text-5xl sm:text-6xl lg:text-[5rem] font-black leading-[0.9] tracking-tight uppercase"
              data-text="REIMAGINED"
              style={{ color: "#E63946" }}>
              REIMAGINED
            </h1>
          </div>

          {/* Halftone divider */}
          <div className="riso-in-3 halftone my-8 h-3 max-w-[200px]" style={{ color: "rgba(230,57,70,0.15)" }} aria-hidden="true" />

          <div className="riso-in-3 grid md:grid-cols-2 gap-8 mb-10">
            <p className="text-sm leading-relaxed font-medium" style={{ color: "rgba(26,26,26,0.5)" }}>
              A DIY approach to career connections. We took the bloated
              internship bureaucracy and ran it through the risograph.
              What came out: skill matching, auto docs, real tracking.
              Two colors. No waste.
            </p>
            <div className="flex flex-col gap-2">
              {["Skill-based matching", "Convention de Stage generator", "Multi-role dashboards", "Zero bureaucracy"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold">
                  <span className="h-2 w-2" style={{ background: i % 2 === 0 ? "#E63946" : "#1E50A2" }} />
                  <span style={{ color: "rgba(26,26,26,0.6)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="riso-in-4 flex flex-col sm:flex-row items-start gap-4">
            <button className="group riso-card flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-[0.1em] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              style={{ background: "#E63946", color: "#F0EBE0", border: "2px solid #1A1A1A" }}
              aria-label="Start exploring">
              PRINT RUN
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button className="group riso-card flex items-center gap-3 px-8 py-4 text-xs font-black uppercase tracking-[0.1em] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
              style={{ background: "#1E50A2", color: "#F0EBE0", border: "2px solid #1A1A1A" }}
              aria-label="Post an offer">
              CONTRIBUTE
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-5">
          {[
            { icon: GraduationCap, title: "STUDENTS", desc: "Build your profile like a zine page. Tag skills, paste your GitHub, search the distro list for placements.", spot: "#E63946" },
            { icon: Building2, title: "COMPANIES", desc: "Run your own print. Post offers, curate submissions, accept the ones that pass quality control.", spot: "#1E50A2" },
            { icon: FileText, title: "ADMIN", desc: "The binding press. Validate placements, auto-print Convention de Stage, count the edition numbers.", spot: "#F4B942" },
          ].map((feat, i) => (
            <div key={i} className="riso-card riso-in-5 p-7 cursor-pointer"
              style={{ background: "#F0EBE0", border: "2px solid #1A1A1A" }}>
              <div className="flex items-center justify-between mb-5">
                <feat.icon className="h-5 w-5" style={{ color: feat.spot }} />
                <span className="text-[8px] font-black tracking-wider px-2 py-1" style={{ background: feat.spot, color: "#F0EBE0" }}>
                  SPOT {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">{feat.title}</h3>
              <p className="text-xs leading-relaxed font-medium" style={{ color: "rgba(26,26,26,0.45)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: "2px solid #1A1A1A" }}>
          {[
            { value: "2.5K+", label: "COPIES", bg: "rgba(230,57,70,0.06)" },
            { value: "350+", label: "PRINTERS", bg: "rgba(30,80,162,0.06)" },
            { value: "45", label: "DISTROS", bg: "rgba(244,185,66,0.06)" },
            { value: "96%", label: "SOLD OUT", bg: "rgba(230,57,70,0.06)" },
          ].map((s, i) => (
            <div key={i} className="p-5 text-center" style={{ background: s.bg, borderRight: i < 3 ? "2px solid #1A1A1A" : "none" }}>
              <div className="text-2xl font-black mb-0.5">{s.value}</div>
              <div className="text-[8px] font-bold tracking-[0.2em]" style={{ color: "rgba(26,26,26,0.3)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
