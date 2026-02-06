"use client";

import { Patrick_Hand, Nunito } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, BookOpen, PenLine } from "lucide-react";

const chalk = Patrick_Hand({ subsets: ["latin"], weight: ["400"] });
const nunito = Nunito({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignChalkboard() {
  return (
    <div className={nunito.className} style={{ background: "#2D3436", color: "#E8E2D4", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes chalk-write {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dust-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(5deg); opacity: 0.6; }
        }
        @keyframes chalk-underline {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .chalk-in { animation: chalk-write 0.5s ease-out both; }
        .chalk-in-2 { animation: chalk-write 0.5s ease-out 0.1s both; }
        .chalk-in-3 { animation: chalk-write 0.5s ease-out 0.2s both; }
        .chalk-in-4 { animation: chalk-write 0.5s ease-out 0.3s both; }
        .chalk-in-5 { animation: chalk-write 0.5s ease-out 0.4s both; }
        .dust { animation: dust-float 4s ease-in-out infinite; }
        .dust-2 { animation: dust-float 5s ease-in-out 1s infinite; }
        .dust-3 { animation: dust-float 6s ease-in-out 2s infinite; }
        .chalk-line {
          transform-origin: left;
          animation: chalk-underline 0.8s ease-out 0.4s both;
        }
        .board-card {
          border: 2px dashed rgba(232,226,212,0.12);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .board-card:hover {
          border-color: rgba(232,226,212,0.25);
          background: rgba(232,226,212,0.03);
          transform: translateY(-3px);
        }
        @media (prefers-reduced-motion: reduce) {
          .chalk-in, .chalk-in-2, .chalk-in-3, .chalk-in-4, .chalk-in-5,
          .dust, .dust-2, .dust-3, .chalk-line {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* Chalkboard texture (green-gray with subtle grain) */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{
          background: "linear-gradient(145deg, #2D3436 0%, #303A3C 30%, #2B3233 60%, #2D3436 100%)",
        }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='c'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23c)'/%3E%3C/svg%3E")`,
        }} />

      {/* Chalk dust particles */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {[
          { t: "20%", l: "15%", s: 3, cls: "dust" },
          { t: "35%", l: "75%", s: 2, cls: "dust-2" },
          { t: "60%", l: "25%", s: 4, cls: "dust-3" },
          { t: "45%", l: "85%", s: 2, cls: "dust" },
          { t: "75%", l: "45%", s: 3, cls: "dust-2" },
          { t: "15%", l: "55%", s: 2, cls: "dust-3" },
        ].map((d, i) => (
          <div key={i} className={`absolute rounded-full ${d.cls}`}
            style={{ top: d.t, left: d.l, width: d.s, height: d.s, background: "#E8E2D4" }} />
        ))}
      </div>

      {/* Wooden frame border */}
      <div className="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
        <div className="absolute top-0 left-0 right-0 h-3" style={{ background: "linear-gradient(to bottom, #5C4033, #4A3328)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-3" style={{ background: "linear-gradient(to top, #5C4033, #4A3328)" }} />
        <div className="absolute top-0 bottom-0 left-0 w-3" style={{ background: "linear-gradient(to right, #5C4033, #4A3328)" }} />
        <div className="absolute top-0 bottom-0 right-0 w-3" style={{ background: "linear-gradient(to left, #5C4033, #4A3328)" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-10 lg:px-20 pt-8 pb-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" style={{ color: "rgba(232,226,212,0.5)" }} />
          <span className={`${chalk.className} text-2xl`}>Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Lesson 1", "Lesson 2", "Lesson 3", "Office Hours"].map((item) => (
            <span key={item} className={`${chalk.className} text-base cursor-pointer transition-colors duration-200`}
              style={{ color: "rgba(232,226,212,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FFD93D")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(232,226,212,0.3)")}>
              {item}
            </span>
          ))}
        </div>
        <button className={`${chalk.className} border-2 border-dashed px-5 py-2 text-base transition-all duration-300 hover:bg-[rgba(232,226,212,0.08)] focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none`}
          style={{ borderColor: "rgba(232,226,212,0.2)", color: "#E8E2D4" }}
          aria-label="Enroll in Stag.io">
          Enroll &rarr;
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-20 px-10 lg:px-20 pt-16 pb-20">
        <div className="mx-auto max-w-5xl">
          {/* "Today's lesson" header */}
          <div className="chalk-in flex items-center gap-3 mb-6">
            <PenLine className="h-4 w-4" style={{ color: "#FFD93D" }} />
            <span className={`${chalk.className} text-lg`} style={{ color: "#FFD93D" }}>
              Today&apos;s Lesson:
            </span>
          </div>

          <h1 className={`${chalk.className} chalk-in-2`}
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)", lineHeight: 1.05, color: "#E8E2D4", textWrap: "balance" }}>
            Finding Your{" "}
            <span className="relative inline-block">
              <span style={{ color: "#7EC8E3" }}>Internship</span>
              {/* Chalk underline (wavy) */}
              <svg className="chalk-line absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" fill="none" aria-hidden="true">
                <path d="M0 6 Q30 2 60 8 Q90 12 120 6 Q150 1 180 7 Q210 12 240 5 Q270 0 300 7"
                  stroke="#7EC8E3" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
              </svg>
            </span>
          </h1>

          <div className="chalk-in-3 mt-10 grid md:grid-cols-2 gap-10">
            <div>
              <p className={`${chalk.className} text-xl leading-relaxed`} style={{ color: "rgba(232,226,212,0.5)" }}>
                Step 1: Build your profile<br />
                Step 2: Search by skills<br />
                Step 3: Apply &amp; match<br />
                Step 4: Get your Convention de Stage!
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {["Skill-based matching", "Auto document generation", "University validation", "Real-time tracking"].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`${chalk.className} text-lg`} style={{ color: "#FFD93D" }}>&#10003;</span>
                  <span className={`${chalk.className} text-lg`} style={{ color: "rgba(232,226,212,0.5)" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chalk-in-4 mt-10 flex flex-col sm:flex-row items-start gap-4">
            <button className={`${chalk.className} group flex items-center gap-2 px-8 py-3.5 text-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(126,200,227,0.15)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none`}
              style={{ background: "#7EC8E3", color: "#2D3436" }}
              aria-label="Start learning">
              Start Learning
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className={`${chalk.className} group flex items-center gap-2 border-2 border-dashed px-8 py-3.5 text-xl transition-all duration-300 hover:bg-[rgba(255,217,61,0.05)] focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:outline-none`}
              style={{ borderColor: "rgba(255,217,61,0.3)", color: "#FFD93D" }}
              aria-label="Post a teaching offer">
              Post Offer
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-20 px-10 lg:px-20 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: "Student Desk", desc: "Build your digital notebook. Tag skills like sticky notes, link your GitHub, and search the board for opportunities.", color: "#7EC8E3" },
            { icon: Building2, title: "Company Podium", desc: "Present to the class. Post offers on the bulletin, review applicants, and hand out acceptance letters.", color: "#FFD93D" },
            { icon: FileText, title: "Dean's Office", desc: "Stamp the official papers. Auto-generate Convention de Stage. Track who's placed and who's still looking.", color: "#FF8A80" },
          ].map((feat, i) => (
            <div key={i} className="board-card chalk-in-5 p-7 cursor-pointer">
              <feat.icon className="h-6 w-6 mb-4" style={{ color: feat.color }} />
              <h3 className={`${chalk.className} text-2xl mb-2`} style={{ color: feat.color }}>{feat.title}</h3>
              <p className={`${chalk.className} text-base leading-relaxed`} style={{ color: "rgba(232,226,212,0.4)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS (chalk tally marks style) --- */}
      <section className="relative z-20 px-10 lg:px-20 pb-24">
        <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,500+", label: "Students", color: "#7EC8E3" },
            { value: "350+", label: "Companies", color: "#FFD93D" },
            { value: "45", label: "Universities", color: "#FF8A80" },
            { value: "96%", label: "Placed", color: "#A5D6A7" },
          ].map((s, i) => (
            <div key={i} className="chalk-in-5">
              <div className={`${chalk.className} text-4xl mb-1`} style={{ color: s.color }}>{s.value}</div>
              <div className={`${chalk.className} text-base`} style={{ color: "rgba(232,226,212,0.25)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
