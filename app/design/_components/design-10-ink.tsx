"use client";

import { Noto_Serif_Display } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Minus } from "lucide-react";

const notoSerif = Noto_Serif_Display({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignInk() {
  return (
    <div className={notoSerif.className} style={{ background: "#FAFAF6", color: "#1A1A18", minHeight: "100vh" }}>
      <style>{`
        @keyframes ink-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ink-draw-h {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes ink-draw-v {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes enso-draw {
          from { stroke-dashoffset: 600; }
          to { stroke-dashoffset: 0; }
        }
        .ink-in { animation: ink-fade 0.8s ease-out both; }
        .ink-in-2 { animation: ink-fade 0.8s ease-out 0.2s both; }
        .ink-in-3 { animation: ink-fade 0.8s ease-out 0.4s both; }
        .ink-in-4 { animation: ink-fade 0.8s ease-out 0.6s both; }
        .ink-line-h {
          transform-origin: left;
          animation: ink-draw-h 0.8s ease-out 0.3s both;
        }
        .ink-line-v {
          transform-origin: top;
          animation: ink-draw-v 0.6s ease-out 0.5s both;
        }
        .enso-path {
          stroke-dasharray: 600;
          animation: enso-draw 2s ease-out 0.4s both;
        }
        .ink-hover {
          transition: color 0.5s ease;
        }
        .ink-hover:hover {
          color: #D44D2D;
        }
        @media (prefers-reduced-motion: reduce) {
          .ink-in, .ink-in-2, .ink-in-3, .ink-in-4, .ink-line-h, .ink-line-v, .enso-path {
            animation: none !important; opacity: 1 !important; transform: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-10 lg:px-20 pt-6 pb-8">
        <span className="text-xl font-light tracking-[0.15em]" style={{ letterSpacing: "0.15em" }}>
          STAG<span style={{ color: "#D44D2D" }}>&middot;</span>IO
        </span>
        <div className="hidden md:flex items-center gap-10">
          {["Discover", "Students", "Partners", "Contact"].map((item) => (
            <span key={item} className="ink-hover text-xs font-light tracking-[0.2em] uppercase cursor-pointer"
              style={{ color: "rgba(26,26,24,0.3)" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="text-xs font-light tracking-[0.2em] uppercase transition-colors duration-500 hover:text-[#D44D2D] focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
          style={{ color: "rgba(26,26,24,0.4)" }}
          aria-label="Enter Stag.io">
          Enter
        </button>
      </nav>

      {/* Thin horizontal line */}
      <div className="ink-line-h mx-10 lg:mx-20 h-px" style={{ background: "rgba(26,26,24,0.08)" }} />

      {/* --- HERO --- */}
      <section className="relative z-10 px-10 lg:px-20 pt-20 pb-28">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-12 gap-16 items-center">
          {/* Enso circle - decorative */}
          <div className="lg:col-span-4 flex items-center justify-center ink-in">
            <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="opacity-[0.07]" aria-hidden="true">
              <path className="enso-path"
                d="M140 30 C200 30, 250 80, 250 140 C250 200, 200 250, 140 250 C80 250, 30 200, 30 140 C30 100, 55 65, 90 45"
                stroke="#1A1A18" strokeWidth="8" strokeLinecap="round" fill="none" />
            </svg>
            {/* Vermillion seal mark */}
            <div className="absolute h-10 w-10 rounded-sm flex items-center justify-center"
              style={{ background: "#D44D2D", transform: "rotate(5deg)" }}>
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
          </div>

          {/* Text content */}
          <div className="lg:col-span-8">
            <h1 className="ink-in-2"
              style={{
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
                lineHeight: 1.1,
                fontWeight: 300,
                letterSpacing: "-0.01em",
                textWrap: "balance",
              }}>
              The Art<br />
              of <span style={{ color: "#D44D2D", fontWeight: 500 }}>Connection</span>
            </h1>

            {/* Thin line separator */}
            <div className="ink-line-h my-10 h-px w-24" style={{ background: "rgba(26,26,24,0.15)" }} />

            <p className="ink-in-3 max-w-sm text-sm font-light leading-[1.9] tracking-wide"
              style={{ color: "rgba(26,26,24,0.4)" }}>
              A platform of quiet precision. Connecting
              university talent with industry through
              considered matching and effortless
              administrative harmony.
            </p>

            <div className="ink-in-4 mt-10 flex items-center gap-8">
              <button className="group flex items-center gap-3 text-sm font-light tracking-[0.1em] transition-colors duration-500 hover:text-[#D44D2D] focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
                aria-label="Begin your journey with Stag.io">
                Begin
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
              </button>
              <div className="h-4 w-px" style={{ background: "rgba(26,26,24,0.1)" }} />
              <span className="text-xs font-light tracking-wider" style={{ color: "rgba(26,26,24,0.25)" }}>
                Free for all students
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Thin horizontal line */}
      <div className="ink-line-h mx-10 lg:mx-20 h-px" style={{ background: "rgba(26,26,24,0.08)" }} />

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-10 lg:px-20 py-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-0">
          {[
            {
              num: "一",
              title: "Student",
              desc: "Build your digital presence. Tag your skills, connect your work, search with purpose.",
            },
            {
              num: "二",
              title: "Enterprise",
              desc: "Present your company. Publish opportunities. Discover talent that aligns with your vision.",
            },
            {
              num: "三",
              title: "Administration",
              desc: "Validate placements. Generate official documents. Observe the flow of outcomes.",
            },
          ].map((feat, i) => (
            <div key={i} className="ink-in-4 py-8 px-8 text-center transition-colors duration-500 cursor-pointer group"
              style={{
                borderRight: i < 2 ? "1px solid rgba(26,26,24,0.06)" : "none",
              }}>
              <div className="text-3xl mb-6 font-light" style={{ color: "rgba(26,26,24,0.1)" }}>
                {feat.num}
              </div>
              <h3 className="text-lg font-light tracking-wide mb-4 group-hover:text-[#D44D2D] transition-colors duration-500">
                {feat.title}
              </h3>
              <p className="text-xs leading-[1.9] font-light" style={{ color: "rgba(26,26,24,0.35)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Thin horizontal line */}
      <div className="ink-line-h mx-10 lg:mx-20 h-px" style={{ background: "rgba(26,26,24,0.08)" }} />

      {/* --- STATS --- */}
      <section className="relative z-10 px-10 lg:px-20 py-20">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: "2,500", label: "Students" },
            { value: "350", label: "Companies" },
            { value: "45", label: "Universities" },
            { value: "96%", label: "Placed" },
          ].map((stat, i) => (
            <div key={i} className="ink-in-4">
              <div className="text-3xl font-light mb-2" style={{ letterSpacing: "0.02em" }}>{stat.value}</div>
              <div className="text-[10px] font-light tracking-[0.25em] uppercase" style={{ color: "rgba(26,26,24,0.25)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
