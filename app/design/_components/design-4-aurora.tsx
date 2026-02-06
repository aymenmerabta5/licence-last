"use client";

import { Sora } from "next/font/google";
import { ArrowRight, Sparkles, GraduationCap, Building2, FileText, Globe, ChevronRight } from "lucide-react";

const sora = Sora({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export function DesignAurora() {
  return (
    <div className={sora.className} style={{ background: "#0F0720", color: "#fff", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes aurora-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-glass {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(0.5deg); }
          66% { transform: translateY(-6px) rotate(-0.3deg); }
        }
        @keyframes aurora-fade-in {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .aurora-bg {
          background: linear-gradient(
            135deg,
            #0d9488 0%,
            #6366f1 25%,
            #8b5cf6 45%,
            #ec4899 65%,
            #6366f1 85%,
            #0d9488 100%
          );
          background-size: 400% 400%;
          animation: aurora-shift 12s ease-in-out infinite;
        }
        .glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .glass-strong {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(32px);
          -webkit-backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .glass-float { animation: float-glass 8s ease-in-out infinite; }
        .glass-float-2 { animation: float-glass 7s ease-in-out 1s infinite; }
        .glass-float-3 { animation: float-glass 9s ease-in-out 2s infinite; }
        .aurora-in { animation: aurora-fade-in 0.6s ease-out both; }
        .aurora-in-2 { animation: aurora-fade-in 0.6s ease-out 0.1s both; }
        .aurora-in-3 { animation: aurora-fade-in 0.6s ease-out 0.2s both; }
        .aurora-in-4 { animation: aurora-fade-in 0.6s ease-out 0.3s both; }
        .aurora-in-5 { animation: aurora-fade-in 0.6s ease-out 0.4s both; }
        .shimmer-text {
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-bg, .glass-float, .glass-float-2, .glass-float-3,
          .aurora-in, .aurora-in-2, .aurora-in-3, .aurora-in-4, .aurora-in-5,
          .shimmer-text { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Aurora background layer */}
      <div className="aurora-bg fixed inset-0 opacity-40" aria-hidden="true" />

      {/* Noise texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="glass h-9 w-9 rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-violet-300" />
          </div>
          <span className="text-xl font-bold tracking-tight">Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {["Platform", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="glass rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-all duration-300 hover:bg-white/15"
              style={{ color: "rgba(255,255,255,0.6)", border: "none" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "#fff" }}
          aria-label="Start using Stag.io">
          Get Started
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-20">
        <div className="mx-auto max-w-5xl text-center">
          {/* Floating glass badge */}
          <div className="aurora-in glass inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8">
            <span className="h-2 w-2 rounded-full" style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }} />
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
              Bridging Students &amp; Industry
            </span>
          </div>

          {/* Main headline */}
          <h1 className="aurora-in-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6"
            style={{ textWrap: "balance" }}>
            Discover Your{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Perfect Match
            </span>
          </h1>

          <p className="aurora-in-3 mx-auto max-w-xl text-base font-light leading-relaxed mb-12"
            style={{ color: "rgba(255,255,255,0.55)" }}>
            Connecting university talent with industry opportunities through intelligent
            skill-based matching and automated administrative workflows.
          </p>

          {/* Glass CTA buttons */}
          <div className="aurora-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
              aria-label="Explore internship opportunities">
              Explore Internships
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="glass-strong rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none"
              style={{ color: "rgba(255,255,255,0.8)" }}
              aria-label="Post a job offer">
              Post an Offer
            </button>
          </div>

          {/* Floating glass feature cards */}
          <div className="aurora-in-5 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Smart Profiles",
                desc: "Digital CV with skill tags, GitHub integration, and portfolio links. Let your expertise shine.",
                float: "glass-float",
              },
              {
                icon: Building2,
                title: "Company Dashboard",
                desc: "Publish offers, filter candidates by skills and location. Accept talent with a single click.",
                float: "glass-float-2",
              },
              {
                icon: FileText,
                title: "Auto Documents",
                desc: "Convention de Stage generated automatically. Pre-filled with student, company, and university data.",
                float: "glass-float-3",
              },
            ].map((feat, i) => (
              <div key={i} className={`${feat.float} glass-strong rounded-2xl p-7 text-left transition-all duration-300 hover:bg-white/15`}>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))" }}>
                  <feat.icon className="h-5 w-5 text-violet-300" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-3xl glass-strong rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2.5K+", label: "Students", color: "#a78bfa" },
              { value: "350+", label: "Companies", color: "#f472b6" },
              { value: "45", label: "Universities", color: "#fb923c" },
              { value: "96%", label: "Placed", color: "#34d399" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
