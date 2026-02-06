"use client";

import { DM_Serif_Display, DM_Sans } from "next/font/google";
import { ArrowRight, Briefcase, GraduationCap, Building2, TrendingUp, Star } from "lucide-react";

const dmSerif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignEditorial() {
  return (
    <div className={dmSans.className} style={{ background: "#FAF7F0", color: "#1A1A1A", minHeight: "100vh" }}>
      <style>{`
        @keyframes editorial-reveal {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes underline-draw {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ed-reveal { animation: editorial-reveal 0.7s ease-out both; }
        .ed-reveal-2 { animation: editorial-reveal 0.7s ease-out 0.12s both; }
        .ed-reveal-3 { animation: editorial-reveal 0.7s ease-out 0.24s both; }
        .ed-reveal-4 { animation: editorial-reveal 0.7s ease-out 0.36s both; }
        .ed-underline::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 0;
          right: 0;
          height: 3px;
          background: #E8520E;
          transform-origin: left;
          animation: underline-draw 0.6s ease-out 0.5s both;
        }
        .ed-marquee { animation: marquee 25s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ed-reveal, .ed-reveal-2, .ed-reveal-3, .ed-reveal-4,
          .ed-underline::after, .ed-marquee { animation: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6"
        style={{ borderBottom: "1px solid rgba(26,26,26,0.1)" }}>
        <div className="flex items-center gap-3">
          <span className={`${dmSerif.className} text-2xl tracking-tight`} style={{ color: "#1A1A1A" }}>
            Stag<span style={{ color: "#E8520E" }}>.</span>io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Discover", "For Students", "For Recruiters", "About"].map((item) => (
            <span key={item} className="relative text-sm font-medium tracking-wide cursor-pointer transition-colors duration-200"
              style={{ color: "rgba(26,26,26,0.45)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#E8520E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,26,0.45)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-none border-2 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:bg-[#1A1A1A] hover:text-[#FAF7F0] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
          aria-label="Get started with Stag.io">
          Get Started
        </button>
      </nav>

      {/* --- MARQUEE RIBBON --- */}
      <div className="overflow-hidden py-3" style={{ background: "#1A1A1A" }}>
        <div className="ed-marquee flex whitespace-nowrap gap-12">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12 shrink-0">
              {["INTERNSHIP MATCHING", "DIGITAL CV", "SMART FILTERS", "AUTO DOCUMENTS", "SKILL TAGS", "REAL-TIME TRACKING"].map((t, i) => (
                <span key={i} className="flex items-center gap-3">
                  <Star className="h-3 w-3" style={{ color: "#E8520E" }} aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-[0.2em]" style={{ color: "#FAF7F0" }}>{t}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* --- HERO --- */}
      <section className="relative px-8 lg:px-16 pt-16 pb-20">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-start">
          {/* Left column - 7 cols */}
          <div className="lg:col-span-7">
            {/* Issue marker */}
            <div className="ed-reveal flex items-center gap-3 mb-8">
              <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "#E8520E" }}>
                Vol. I — 2025
              </span>
              <div className="flex-1 h-px" style={{ background: "rgba(26,26,26,0.15)" }} />
            </div>

            <h1 className={`${dmSerif.className} ed-reveal-2`}
              style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", lineHeight: 1.02, letterSpacing: "-0.02em", textWrap: "balance" }}>
              The Future{" "}
              <span className="relative inline-block ed-underline" style={{ color: "#E8520E" }}>
                of Internship
              </span>{" "}
              Discovery
            </h1>

            <div className="ed-reveal-3 mt-10 grid grid-cols-2 gap-8" style={{ borderTop: "1px solid rgba(26,26,26,0.1)", paddingTop: "2rem" }}>
              <p className="text-sm leading-relaxed font-light" style={{ color: "rgba(26,26,26,0.6)" }}>
                A centralized platform bridging the gap between universities and enterprises.
                Skill-based matching, automated document generation, and placement tracking&mdash;all
                in one elegant system.
              </p>
              <p className="text-sm leading-relaxed font-light" style={{ color: "rgba(26,26,26,0.6)" }}>
                Within the framework of MESRS strategy to strengthen the University-Enterprise link,
                Stag.io digitizes the entire internship lifecycle from discovery to official
                Convention de Stage.
              </p>
            </div>

            <div className="ed-reveal-4 mt-10 flex items-center gap-6">
              <button className="group flex items-center gap-3 text-sm font-bold uppercase tracking-[0.15em] transition-colors duration-300 hover:text-[#E8520E] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
                style={{ color: "#1A1A1A" }}
                aria-label="Explore the platform">
                Explore Platform
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </button>
              <div className="h-5 w-px" style={{ background: "rgba(26,26,26,0.2)" }} />
              <span className="text-xs tracking-wide" style={{ color: "rgba(26,26,26,0.4)" }}>Free for Students</span>
            </div>
          </div>

          {/* Right column - 5 cols, stacked editorial cards */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {[
              { num: "01", title: "Student Space", desc: "Build your profile, tag skills, connect GitHub. Search and apply with smart filters.", icon: GraduationCap },
              { num: "02", title: "Company Portal", desc: "Publish offers, track candidates, accept talent. One click triggers the full workflow.", icon: Building2 },
              { num: "03", title: "Admin Dashboard", desc: "Validate placements, generate official PDFs, access global placement analytics.", icon: TrendingUp },
            ].map((item, i) => (
              <div key={i} className="group relative p-6 transition-all duration-400 cursor-pointer"
                style={{ border: "1px solid rgba(26,26,26,0.08)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1A1A1A";
                  e.currentTarget.style.color = "#FAF7F0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#1A1A1A";
                }}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`${dmSerif.className} text-4xl font-normal`} style={{ color: "#E8520E" }}>
                    {item.num}
                  </span>
                  <item.icon className="h-5 w-5 opacity-30" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2">{item.title}</h3>
                <p className="text-xs leading-relaxed font-light opacity-60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-0"
          style={{ borderTop: "2px solid #1A1A1A", borderBottom: "2px solid #1A1A1A" }}>
          {[
            { value: "2,500+", label: "Students Connected" },
            { value: "350+", label: "Partner Companies" },
            { value: "45", label: "Universities" },
            { value: "96%", label: "Placement Rate" },
          ].map((stat, i) => (
            <div key={i} className="py-8 px-6 text-center"
              style={{ borderRight: i < 3 ? "1px solid rgba(26,26,26,0.1)" : "none" }}>
              <div className={`${dmSerif.className} text-4xl mb-1`}>{stat.value}</div>
              <div className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: "rgba(26,26,26,0.35)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
