"use client";

import { Archivo } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Shapes, Triangle, Circle } from "lucide-react";

const archivo = Archivo({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800", "900"] });

export function DesignTerrazzo() {
  return (
    <div className={archivo.className} style={{ background: "#FDF5EC", color: "#1A1A2E", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes memphis-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes memphis-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes memphis-pop {
          0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
          60% { transform: scale(1.05) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes wiggle-slow {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .mem-bounce { animation: memphis-bounce 4s ease-in-out infinite; }
        .mem-bounce-2 { animation: memphis-bounce 5s ease-in-out 0.5s infinite; }
        .mem-bounce-3 { animation: memphis-bounce 6s ease-in-out 1s infinite; }
        .mem-spin { animation: memphis-spin 20s linear infinite; }
        .mem-pop { animation: memphis-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .mem-pop-2 { animation: memphis-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both; }
        .mem-pop-3 { animation: memphis-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .mem-pop-4 { animation: memphis-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
        .mem-pop-5 { animation: memphis-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.4s both; }
        .mem-wiggle { animation: wiggle-slow 3s ease-in-out infinite; }
        .mem-card {
          border: 3px solid #1A1A2E;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;
        }
        .mem-card:hover {
          transform: translate(-4px, -4px) rotate(-1deg);
          box-shadow: 8px 8px 0px #1A1A2E;
        }
        @media (prefers-reduced-motion: reduce) {
          .mem-bounce, .mem-bounce-2, .mem-bounce-3, .mem-spin,
          .mem-pop, .mem-pop-2, .mem-pop-3, .mem-pop-4, .mem-pop-5, .mem-wiggle {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Floating Memphis shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Circles */}
        <div className="mem-bounce absolute top-[8%] left-[5%] h-16 w-16 rounded-full" style={{ background: "#FF6B6B", opacity: 0.15 }} />
        <div className="mem-bounce-2 absolute top-[60%] right-[8%] h-24 w-24 rounded-full border-[4px]" style={{ borderColor: "#4ECDC4", opacity: 0.2 }} />
        <div className="mem-bounce-3 absolute bottom-[15%] left-[12%] h-10 w-10 rounded-full" style={{ background: "#FFD93D", opacity: 0.2 }} />
        {/* Triangles (CSS) */}
        <div className="mem-bounce-2 absolute top-[20%] right-[20%]"
          style={{ width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderBottom: "35px solid rgba(255,107,107,0.15)" }} />
        <div className="mem-bounce absolute top-[45%] left-[80%]"
          style={{ width: 0, height: 0, borderLeft: "15px solid transparent", borderRight: "15px solid transparent", borderBottom: "25px solid rgba(78,205,196,0.15)" }} />
        {/* Squares */}
        <div className="mem-wiggle absolute top-[70%] left-[70%] h-12 w-12" style={{ background: "rgba(255,107,107,0.08)", transform: "rotate(15deg)" }} />
        <div className="mem-spin absolute top-[15%] left-[45%] h-8 w-8 rounded-sm border-[3px]" style={{ borderColor: "rgba(255,217,61,0.2)" }} />
        {/* Dots pattern */}
        {[
          { t: "25%", l: "90%", s: 6, c: "#FF6B6B" },
          { t: "80%", l: "30%", s: 8, c: "#4ECDC4" },
          { t: "10%", l: "60%", s: 5, c: "#FFD93D" },
          { t: "50%", l: "3%", s: 7, c: "#A78BFA" },
          { t: "35%", l: "95%", s: 4, c: "#FF6B6B" },
        ].map((d, i) => (
          <div key={i} className={`mem-bounce${i % 3 === 0 ? "" : i % 3 === 1 ? "-2" : "-3"} absolute rounded-full`}
            style={{ top: d.t, left: d.l, width: d.s, height: d.s, background: d.c, opacity: 0.3 }} />
        ))}
        {/* Squiggly lines (SVG) */}
        <svg className="mem-bounce absolute" style={{ top: "55%", left: "15%", opacity: 0.12 }} width="80" height="20" viewBox="0 0 80 20" fill="none">
          <path d="M0 10 Q10 0 20 10 Q30 20 40 10 Q50 0 60 10 Q70 20 80 10" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
        <svg className="mem-bounce-3 absolute" style={{ top: "30%", left: "35%", opacity: 0.1 }} width="60" height="15" viewBox="0 0 60 15" fill="none">
          <path d="M0 7 Q10 0 20 7 Q30 15 40 7 Q50 0 60 7" stroke="#FF6B6B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <Shapes className="h-5 w-5" style={{ color: "#FF6B6B" }} />
          <span className="text-xl font-black tracking-tight uppercase">STAG.IO</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {["Discover", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="rounded-full px-4 py-2 text-sm font-bold cursor-pointer transition-all duration-200 hover:bg-[#1A1A2E] hover:text-[#FDF5EC]"
              style={{ color: "rgba(26,26,46,0.5)" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="mem-card rounded-none px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-200 focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
          style={{ background: "#FF6B6B", color: "#FFF", border: "3px solid #1A1A2E" }}
          aria-label="Get started">
          LET&apos;S GO!
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-12 pb-16">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mem-pop inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8"
            style={{ background: "#FFD93D", border: "2px solid #1A1A2E" }}>
            <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#1A1A2E" }}>
              New &bull; Fresh &bull; Bold
            </span>
          </div>

          <h1 className="mem-pop-2 text-5xl sm:text-6xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight uppercase mb-6"
            style={{ textWrap: "balance" }}>
            Internships{" "}
            <span className="relative inline-block">
              <span style={{ color: "#FF6B6B" }}>Reimagined</span>
              {/* Decorative underline shapes */}
              <svg className="absolute -bottom-3 left-0 w-full h-4" viewBox="0 0 300 16" fill="none" aria-hidden="true">
                <path d="M0 8 Q75 0 150 8 T300 8" stroke="#4ECDC4" strokeWidth="4" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="mem-pop-3 mx-auto max-w-md text-base font-medium leading-relaxed mb-10"
            style={{ color: "rgba(26,26,46,0.5)" }}>
            Skill matching, automated docs, real-time tracking.
            The most fun way to find your perfect internship.
          </p>

          <div className="mem-pop-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group mem-card flex items-center gap-2 rounded-none px-8 py-4 text-sm font-black uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ background: "#4ECDC4", color: "#1A1A2E" }}
              aria-label="Start exploring">
              EXPLORE
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button className="group mem-card flex items-center gap-2 rounded-none px-8 py-4 text-sm font-black uppercase tracking-wider focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none"
              style={{ background: "#FDF5EC", color: "#1A1A2E" }}
              aria-label="Post an offer">
              POST OFFER
            </button>
          </div>

          {/* Feature cards */}
          <div className="mem-pop-5 grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: "BUILD YOUR PROFILE", desc: "Digital CV with skill tags, GitHub links, and portfolio. Smart search by location and tech.", bg: "#FF6B6B", shape: "circle" },
              { icon: Building2, title: "FIND TALENT", desc: "Publish offers, track candidates, and accept talent. One click starts the full workflow.", bg: "#4ECDC4", shape: "triangle" },
              { icon: FileText, title: "AUTO DOCS", desc: "Convention de Stage generated instantly. Pre-filled with student, company, and university data.", bg: "#FFD93D", shape: "square" },
            ].map((feat, i) => (
              <div key={i} className="mem-card rounded-none p-7 text-left cursor-pointer"
                style={{ background: "#FDF5EC" }}>
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center"
                  style={{ background: feat.bg, border: "3px solid #1A1A2E" }}>
                  <feat.icon className="h-5 w-5" style={{ color: "#FFF" }} />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight mb-2">{feat.title}</h3>
                <p className="text-sm leading-relaxed font-medium" style={{ color: "rgba(26,26,46,0.45)" }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "2.5K+", label: "Students", bg: "#FF6B6B" },
            { value: "350+", label: "Companies", bg: "#4ECDC4" },
            { value: "45", label: "Universities", bg: "#FFD93D" },
            { value: "96%", label: "Placed", bg: "#A78BFA" },
          ].map((s, i) => (
            <div key={i} className="p-5 text-center" style={{ background: s.bg, border: "3px solid #1A1A2E" }}>
              <div className="text-3xl font-black mb-1" style={{ color: "#1A1A2E" }}>{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(26,26,46,0.5)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
