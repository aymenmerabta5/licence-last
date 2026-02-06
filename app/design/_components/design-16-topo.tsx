"use client";

import { Overpass } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, MapPin, Compass, Mountain } from "lucide-react";

const overpass = Overpass({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export function DesignTopo() {
  return (
    <div className={overpass.className} style={{ background: "#0F172A", color: "#CBD5E1", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes topo-fade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes contour-pulse {
          0%, 100% { opacity: 0.06; }
          50% { opacity: 0.1; }
        }
        @keyframes pin-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .topo-in { animation: topo-fade 0.6s ease-out both; }
        .topo-in-2 { animation: topo-fade 0.6s ease-out 0.1s both; }
        .topo-in-3 { animation: topo-fade 0.6s ease-out 0.2s both; }
        .topo-in-4 { animation: topo-fade 0.6s ease-out 0.3s both; }
        .topo-in-5 { animation: topo-fade 0.6s ease-out 0.4s both; }
        .contour-bg { animation: contour-pulse 5s ease-in-out infinite; }
        .pin-float { animation: pin-bounce 3s ease-in-out infinite; }
        .pin-float-2 { animation: pin-bounce 3.5s ease-in-out 0.5s infinite; }
        .topo-card {
          border: 1px solid rgba(203,213,225,0.06);
          background: rgba(203,213,225,0.02);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .topo-card:hover {
          border-color: rgba(56,189,148,0.3);
          background: rgba(56,189,148,0.04);
          transform: translateY(-4px);
        }
        @media (prefers-reduced-motion: reduce) {
          .topo-in, .topo-in-2, .topo-in-3, .topo-in-4, .topo-in-5,
          .contour-bg, .pin-float, .pin-float-2 {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .contour-bg { opacity: 0.06 !important; }
        }
      `}</style>

      {/* Topographic contour lines background */}
      <div className="contour-bg fixed inset-0 pointer-events-none" aria-hidden="true">
        <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice">
          {/* Contour rings - multiple elevation levels */}
          {[
            { cx: 350, cy: 300, radii: [60, 100, 145, 195, 250, 310], color: "#38BD94" },
            { cx: 850, cy: 450, radii: [40, 75, 115, 160, 210], color: "#38BD94" },
            { cx: 600, cy: 150, radii: [30, 55, 85, 120], color: "#6366F1" },
            { cx: 200, cy: 600, radii: [35, 65, 100, 140, 185], color: "#38BD94" },
            { cx: 1000, cy: 200, radii: [25, 50, 80], color: "#6366F1" },
          ].map((group, gi) =>
            group.radii.map((r, ri) => (
              <ellipse key={`${gi}-${ri}`} cx={group.cx} cy={group.cy}
                rx={r * (1 + Math.sin(ri * 0.5) * 0.15)} ry={r * (1 + Math.cos(ri * 0.3) * 0.2)}
                stroke={group.color} strokeWidth="1" fill="none" opacity={0.4 - ri * 0.05}
                transform={`rotate(${gi * 12 + ri * 3} ${group.cx} ${group.cy})`} />
            ))
          )}
        </svg>
      </div>

      {/* Floating map pins */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <MapPin className="pin-float absolute h-4 w-4" style={{ top: "22%", left: "28%", color: "rgba(56,189,148,0.2)" }} />
        <MapPin className="pin-float-2 absolute h-3 w-3" style={{ top: "55%", right: "25%", color: "rgba(99,102,241,0.2)" }} />
        <MapPin className="pin-float absolute h-3.5 w-3.5" style={{ top: "70%", left: "18%", color: "rgba(56,189,148,0.15)" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(203,213,225,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <Compass className="h-5 w-5" style={{ color: "#38BD94" }} />
          <span className="text-lg font-bold tracking-tight">Stag.io</span>
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full ml-1"
            style={{ background: "rgba(56,189,148,0.1)", color: "#38BD94" }}>
            BETA
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Explore", "Students", "Companies", "Map"].map((item) => (
            <span key={item} className="text-xs font-medium tracking-wide cursor-pointer transition-colors duration-200"
              style={{ color: "rgba(203,213,225,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#38BD94")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(203,213,225,0.3)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-lg px-5 py-2.5 text-xs font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,148,0.2)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          style={{ background: "#38BD94", color: "#0F172A" }}
          aria-label="Start navigating">
          Start Navigating
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-20 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="topo-in flex items-center gap-3 mb-6">
            <Mountain className="h-4 w-4" style={{ color: "rgba(56,189,148,0.4)" }} />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: "rgba(56,189,148,0.5)" }}>
              NAVIGATE YOUR CAREER TERRAIN
            </span>
          </div>

          <h1 className="topo-in-2 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.02] tracking-tight mb-6"
            style={{ color: "#F1F5F9", textWrap: "balance" }}>
            Chart Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #38BD94, #6366F1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Path Forward
            </span>
          </h1>

          <p className="topo-in-3 max-w-lg text-sm font-light leading-relaxed mb-10"
            style={{ color: "rgba(203,213,225,0.45)" }}>
            Navigate the internship landscape with precision. Skill-based elevation matching,
            location-aware search, and automated document generation guide you from
            exploration to placement.
          </p>

          <div className="topo-in-4 flex flex-col sm:flex-row items-start gap-4 mb-20">
            <button className="group flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,148,0.2)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              style={{ background: "#38BD94", color: "#0F172A" }}
              aria-label="Explore internship terrain">
              Explore Terrain
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-2 rounded-lg border px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-[rgba(99,102,241,0.08)] focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
              style={{ borderColor: "rgba(99,102,241,0.25)", color: "#818CF8" }}
              aria-label="Post an internship offer">
              Drop a Pin
            </button>
          </div>

          {/* Feature cards */}
          <div className="topo-in-5 grid md:grid-cols-3 gap-5">
            {[
              { icon: GraduationCap, title: "Elevation: Student", desc: "Build your profile with skill coordinates. Plot your GitHub, portfolio, and academic markers on your career map.", elev: "ELV 01", color: "#38BD94" },
              { icon: Building2, title: "Elevation: Company", desc: "Establish your base camp. Post opportunities, survey candidates, and signal acceptance to trigger formal routes.", elev: "ELV 02", color: "#818CF8" },
              { icon: FileText, title: "Elevation: Admin", desc: "Oversee the terrain. Validate routes, auto-generate Convention de Stage documents, and monitor placement contours.", elev: "ELV 03", color: "#38BD94" },
            ].map((feat, i) => (
              <div key={i} className="topo-card rounded-xl p-7 cursor-pointer">
                <div className="flex items-center justify-between mb-5">
                  <feat.icon className="h-5 w-5" style={{ color: feat.color }} />
                  <span className="text-[9px] font-bold tracking-[0.15em] px-2 py-1 rounded"
                    style={{ background: `${feat.color}10`, color: feat.color }}>
                    {feat.elev}
                  </span>
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#F1F5F9" }}>{feat.title}</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(203,213,225,0.4)" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl rounded-xl p-7" style={{ border: "1px solid rgba(56,189,148,0.08)", background: "rgba(56,189,148,0.02)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2.5K+", label: "Waypoints", color: "#38BD94" },
              { value: "350+", label: "Base Camps", color: "#818CF8" },
              { value: "45", label: "Regions", color: "#38BD94" },
              { value: "96%", label: "Summit Rate", color: "#818CF8" },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1" style={{ color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                <div className="text-[9px] font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(203,213,225,0.25)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
