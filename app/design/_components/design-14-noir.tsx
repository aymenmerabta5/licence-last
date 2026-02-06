"use client";

import { Playfair_Display } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Film, Eye } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export function DesignNoir() {
  return (
    <div className={playfair.className} style={{ background: "#0A0A0A", color: "#E8E8E8", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes noir-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes noir-slide {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spotlight-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.06; }
          50% { transform: translate(-45%, -55%) scale(1.1); opacity: 0.09; }
        }
        @keyframes grain-shift {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2%, -3%); }
          20% { transform: translate(3%, 1%); }
          30% { transform: translate(-1%, 2%); }
          40% { transform: translate(2%, -2%); }
          50% { transform: translate(-3%, 3%); }
          60% { transform: translate(1%, -1%); }
          70% { transform: translate(-2%, 2%); }
          80% { transform: translate(3%, -3%); }
          90% { transform: translate(-1%, 1%); }
          100% { transform: translate(0, 0); }
        }
        .noir-in { animation: noir-fade 1s ease-out both; }
        .noir-in-2 { animation: noir-slide 0.8s ease-out 0.15s both; }
        .noir-in-3 { animation: noir-slide 0.8s ease-out 0.3s both; }
        .noir-in-4 { animation: noir-slide 0.8s ease-out 0.45s both; }
        .noir-in-5 { animation: noir-slide 0.8s ease-out 0.6s both; }
        .spotlight { animation: spotlight-drift 8s ease-in-out infinite; }
        .film-grain {
          animation: grain-shift 0.5s steps(4) infinite;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }
        .noir-card {
          border-bottom: 1px solid rgba(232,232,232,0.08);
          transition: background 0.5s ease, padding-left 0.3s ease;
        }
        .noir-card:hover {
          background: rgba(232,232,232,0.03);
          padding-left: 2rem;
        }
        @media (prefers-reduced-motion: reduce) {
          .noir-in, .noir-in-2, .noir-in-3, .noir-in-4, .noir-in-5, .spotlight, .film-grain {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .film-grain { opacity: 0.03 !important; }
        }
      `}</style>

      {/* Film grain overlay */}
      <div className="film-grain fixed inset-0 pointer-events-none" aria-hidden="true" />

      {/* Spotlight effect */}
      <div className="spotlight fixed pointer-events-none" aria-hidden="true"
        style={{
          top: "30%", left: "60%", width: "800px", height: "800px",
          background: "radial-gradient(ellipse, rgba(232,232,232,0.08), transparent 70%)",
          transform: "translate(-50%, -50%)",
        }} />

      {/* Letterbox bars */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-30" style={{ background: "#0A0A0A" }} aria-hidden="true" />
      <div className="fixed bottom-0 left-0 right-0 h-[3px] z-30" style={{ background: "#0A0A0A" }} aria-hidden="true" />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-10 lg:px-20 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <Film className="h-4 w-4" style={{ color: "rgba(232,232,232,0.3)" }} />
          <span className="text-lg font-normal tracking-[0.2em] uppercase" style={{ fontWeight: 400, letterSpacing: "0.2em" }}>
            Stag.io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Discover", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="text-xs tracking-[0.15em] uppercase cursor-pointer transition-colors duration-500"
              style={{ color: "rgba(232,232,232,0.2)", fontWeight: 400 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,232,232,0.2)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="text-xs tracking-[0.2em] uppercase transition-colors duration-500 hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
          style={{ color: "rgba(232,232,232,0.3)", fontWeight: 400 }}
          aria-label="Enter the platform">
          Enter
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-10 lg:px-20 pt-20 pb-24">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-12 gap-16 items-end">
          {/* Left - massive headline */}
          <div className="lg:col-span-8">
            <div className="noir-in mb-6">
              <Eye className="h-5 w-5" style={{ color: "rgba(232,232,232,0.15)" }} />
            </div>

            <h1 className="noir-in-2"
              style={{
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                lineHeight: 0.95,
                fontWeight: 900,
                fontStyle: "italic",
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
                textWrap: "balance",
              }}>
              Every Career<br />
              Has a{" "}
              <span style={{
                fontStyle: "normal",
                fontWeight: 400,
                color: "rgba(232,232,232,0.4)",
              }}>
                Story
              </span>
            </h1>

            <div className="noir-in-3 h-px my-10" style={{ background: "linear-gradient(to right, rgba(232,232,232,0.15), transparent)", maxWidth: "300px" }} />

            <p className="noir-in-3 max-w-sm text-sm leading-[1.9] tracking-wide" style={{ color: "rgba(232,232,232,0.3)", fontWeight: 400, fontStyle: "normal" }}>
              In the shadows of bureaucracy, a light emerges. Where students
              find their purpose and companies discover their next chapter.
              The stage is set.
            </p>

            <div className="noir-in-4 mt-10 flex items-center gap-6">
              <button className="group flex items-center gap-3 px-7 py-3.5 text-xs font-normal tracking-[0.2em] uppercase transition-all duration-500 hover:bg-white hover:text-[#0A0A0A] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
                style={{ border: "1px solid rgba(232,232,232,0.2)", color: "#E8E8E8" }}
                aria-label="Begin your career story">
                Begin
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
              </button>
              <span className="text-[10px] tracking-[0.15em]" style={{ color: "rgba(232,232,232,0.15)" }}>
                Act I
              </span>
            </div>
          </div>

          {/* Right - vertical stats */}
          <div className="lg:col-span-4 flex flex-col gap-0">
            {[
              { value: "2,500+", label: "Placements" },
              { value: "350+", label: "Companies" },
              { value: "96%", label: "Success" },
            ].map((stat, i) => (
              <div key={i} className="noir-in-5 py-6" style={{ borderBottom: "1px solid rgba(232,232,232,0.06)" }}>
                <div className="text-4xl font-light mb-1" style={{ fontStyle: "italic", color: "#FFFFFF" }}>{stat.value}</div>
                <div className="text-[10px] font-normal tracking-[0.25em] uppercase" style={{ color: "rgba(232,232,232,0.2)" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-10 lg:px-20 pb-24">
        <div className="mx-auto max-w-5xl">
          {[
            { num: "I", title: "The Student", desc: "Craft your digital identity. Tag your skills, link your work. Search the shadows for the perfect opportunity." },
            { num: "II", title: "The Company", desc: "Present your stage. Publish your roles, evaluate the talent that emerges from the darkness of uncertainty." },
            { num: "III", title: "The Bureau", desc: "Validate the union. Generate the documents. Watch the numbers tell their story across the institutional landscape." },
          ].map((feat, i) => (
            <div key={i} className="noir-card noir-in-5 py-8 px-4 flex items-start gap-8 cursor-pointer">
              <span className="text-3xl font-light shrink-0" style={{ fontStyle: "italic", color: "rgba(232,232,232,0.12)", minWidth: "50px" }}>
                {feat.num}
              </span>
              <div>
                <h3 className="text-lg font-medium tracking-wide mb-2" style={{ fontStyle: "italic" }}>{feat.title}</h3>
                <p className="text-xs leading-[1.9] font-normal" style={{ color: "rgba(232,232,232,0.3)", fontStyle: "normal" }}>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
