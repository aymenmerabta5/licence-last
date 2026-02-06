"use client";

import { Quicksand } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Rocket, Heart, Sparkles, Search, Users } from "lucide-react";

const quicksand = Quicksand({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export function DesignPlayful() {
  return (
    <div className={quicksand.className} style={{ background: "#FFFBF5", color: "#2D2B3D", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes blob-1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blob-2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.05); }
          66% { transform: translate(25px, -30px) scale(0.92); }
        }
        @keyframes blob-3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(20px, 40px) scale(0.98); }
          66% { transform: translate(-30px, -20px) scale(1.06); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          60% { transform: translateY(-5px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          75% { transform: rotate(3deg); }
        }
        @keyframes float-dot {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .blob-1 { animation: blob-1 8s ease-in-out infinite; }
        .blob-2 { animation: blob-2 10s ease-in-out infinite; }
        .blob-3 { animation: blob-3 12s ease-in-out infinite; }
        .pop-in { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .pop-in-2 { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both; }
        .pop-in-3 { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both; }
        .pop-in-4 { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
        .pop-in-5 { animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s both; }
        .wiggle-hover:hover { animation: wiggle 0.4s ease-in-out; }
        .candy-card {
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        .candy-card:hover {
          transform: translateY(-8px) rotate(-1deg);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        }
        .dot-float { animation: float-dot 3s ease-in-out infinite; }
        .dot-float-2 { animation: float-dot 3.5s ease-in-out 0.5s infinite; }
        .dot-float-3 { animation: float-dot 4s ease-in-out 1s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .blob-1, .blob-2, .blob-3, .pop-in, .pop-in-2, .pop-in-3, .pop-in-4, .pop-in-5,
          .wiggle-hover:hover, .dot-float, .dot-float-2, .dot-float-3 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .candy-card:hover {
            transform: translateY(-4px) !important;
          }
        }
      `}</style>

      {/* Animated blob backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="blob-1 absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #FF6B6B 0%, transparent 70%)" }} />
        <div className="blob-2 absolute top-1/3 -left-24 w-[400px] h-[400px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #4ECDC4 0%, transparent 70%)" }} />
        <div className="blob-3 absolute -bottom-20 right-1/4 w-[450px] h-[450px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #A78BFA 0%, transparent 70%)" }} />
        <div className="blob-2 absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #FFE66D 0%, transparent 70%)" }} />
      </div>

      {/* Floating decorative dots */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        {[
          { top: "15%", left: "10%", bg: "#FF6B6B", size: 8, cls: "dot-float" },
          { top: "25%", right: "15%", bg: "#4ECDC4", size: 6, cls: "dot-float-2" },
          { top: "60%", left: "8%", bg: "#A78BFA", size: 10, cls: "dot-float-3" },
          { top: "70%", right: "12%", bg: "#FFE66D", size: 7, cls: "dot-float" },
          { top: "40%", left: "85%", bg: "#FF6B6B", size: 5, cls: "dot-float-2" },
        ].map((dot, i) => (
          <div key={i} className={`absolute rounded-full ${dot.cls}`}
            style={{
              top: dot.top,
              left: dot.left,
              right: (dot as { right?: string }).right,
              width: dot.size,
              height: dot.size,
              background: dot.bg,
              opacity: 0.5,
            }} />
        ))}
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B6B, #A78BFA)" }}>
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold" style={{ color: "#2D2B3D" }}>
            Stag<span style={{ color: "#FF6B6B" }}>.</span>io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {["Discover", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="wiggle-hover rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-white/60"
              style={{ color: "rgba(45,43,61,0.5)" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-full px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
          style={{ background: "linear-gradient(135deg, #FF6B6B, #A78BFA)" }}
          aria-label="Sign up for Stag.io">
          Sign Up Free
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-12 pb-20">
        <div className="mx-auto max-w-5xl text-center">
          {/* Playful badge */}
          <div className="pop-in inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8"
            style={{ background: "rgba(167,139,250,0.1)", border: "2px dashed rgba(167,139,250,0.3)" }}>
            <Heart className="h-3.5 w-3.5" style={{ color: "#FF6B6B" }} aria-hidden="true" />
            <span className="text-xs font-semibold" style={{ color: "#A78BFA" }}>
              Made for Students, by Students
            </span>
          </div>

          {/* Main headline */}
          <h1 className="pop-in-2 text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6"
            style={{ color: "#2D2B3D", textWrap: "balance" }}>
            Find Your Dream{" "}
            <span className="relative inline-block">
              <span style={{ color: "#FF6B6B" }}>Internship</span>
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                <path d="M2 8 C40 2, 80 12, 120 6 C150 2, 180 10, 198 5" stroke="#FFE66D" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
            !
          </h1>

          <p className="pop-in-3 mx-auto max-w-lg text-base font-medium leading-relaxed mb-10"
            style={{ color: "rgba(45,43,61,0.5)" }}>
            Connect with amazing companies, showcase your skills, and land
            the perfect internship. All in one fun, easy-to-use platform.
          </p>

          {/* CTAs */}
          <div className="pop-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_rgba(255,107,107,0.3)] focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:outline-none"
              style={{ background: "linear-gradient(135deg, #FF6B6B, #E05555)" }}
              aria-label="Start exploring internships">
              Start Exploring
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-2 rounded-full border-2 px-8 py-4 text-sm font-bold transition-all duration-300 hover:scale-105 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:outline-none"
              style={{ borderColor: "#4ECDC4", color: "#4ECDC4" }}
              aria-label="Post an internship offer">
              I&rsquo;m Hiring
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          {/* Feature cards */}
          <div className="pop-in-5 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Build Your Profile",
                desc: "Create an awesome digital CV with skill tags, GitHub link, and portfolio. Show off what makes you special!",
                bg: "#FF6B6B",
                bgLight: "rgba(255,107,107,0.06)",
                borderColor: "rgba(255,107,107,0.15)",
              },
              {
                icon: Search,
                title: "Smart Search",
                desc: "Filter by location, tech stack, and internship type. Our matching engine finds the perfect fit for your skills.",
                bg: "#4ECDC4",
                bgLight: "rgba(78,205,196,0.06)",
                borderColor: "rgba(78,205,196,0.15)",
              },
              {
                icon: FileText,
                title: "Auto Documents",
                desc: "Once accepted, your internship agreement is generated automatically. No more paperwork headaches!",
                bg: "#A78BFA",
                bgLight: "rgba(167,139,250,0.06)",
                borderColor: "rgba(167,139,250,0.15)",
              },
            ].map((feat, i) => (
              <div key={i} className="candy-card rounded-3xl border-2 p-7 text-left cursor-pointer"
                style={{ background: feat.bgLight, borderColor: feat.borderColor }}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ background: feat.bg }}>
                  <feat.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#2D2B3D" }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(45,43,61,0.5)" }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-3xl rounded-3xl p-8"
          style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.05), rgba(78,205,196,0.05), rgba(167,139,250,0.05))", border: "2px solid rgba(45,43,61,0.06)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2.5K+", label: "Happy Students", color: "#FF6B6B" },
              { value: "350+", label: "Cool Companies", color: "#4ECDC4" },
              { value: "45", label: "Universities", color: "#A78BFA" },
              { value: "96%", label: "Got Placed!", color: "#FFE66D" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs font-semibold" style={{ color: "rgba(45,43,61,0.35)" }}>
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
