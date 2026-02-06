"use client";

import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Sun, Sparkles, Heart } from "lucide-react";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export function DesignSunset() {
  return (
    <div className={jakarta.className} style={{ color: "#FFFFFF", minHeight: "100vh", overflow: "hidden" }}>
      <style>{`
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes sunset-fade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .wave-anim { animation: wave-flow 15s linear infinite; }
        .sun-in { animation: sunset-fade 0.7s ease-out both; }
        .sun-in-2 { animation: sunset-fade 0.7s ease-out 0.1s both; }
        .sun-in-3 { animation: sunset-fade 0.7s ease-out 0.2s both; }
        .sun-in-4 { animation: sunset-fade 0.7s ease-out 0.3s both; }
        .sun-in-5 { animation: sunset-fade 0.7s ease-out 0.4s both; }
        .gentle-float { animation: gentle-float 6s ease-in-out infinite; }
        .gentle-float-2 { animation: gentle-float 7s ease-in-out 1s infinite; }
        .gentle-float-3 { animation: gentle-float 8s ease-in-out 2s infinite; }
        .sunset-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.15);
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), background 0.3s ease;
        }
        .sunset-card:hover {
          transform: translateY(-6px);
          background: rgba(255,255,255,0.18);
        }
        @media (prefers-reduced-motion: reduce) {
          .wave-anim, .sun-in, .sun-in-2, .sun-in-3, .sun-in-4, .sun-in-5,
          .gentle-float, .gentle-float-2, .gentle-float-3 {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .sunset-card:hover { transform: none; }
        }
      `}</style>

      {/* Gradient background */}
      <div className="fixed inset-0" aria-hidden="true"
        style={{
          background: "linear-gradient(135deg, #F59E0B 0%, #F97316 20%, #EF4444 40%, #F43F5E 55%, #EC4899 70%, #A855F7 85%, #7C3AED 100%)",
        }} />

      {/* Decorative blobs */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="gentle-float absolute top-[10%] right-[15%] w-[200px] h-[200px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />
        <div className="gentle-float-2 absolute bottom-[20%] left-[10%] w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06), transparent 70%)" }} />
        <div className="gentle-float-3 absolute top-[40%] left-[60%] w-[150px] h-[150px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)" }} />
      </div>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <Sun className="h-6 w-6 text-white" />
          <span className="text-xl font-bold tracking-tight">Stag.io</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5">
          {["Discover", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.6)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.25)" }}
          aria-label="Sign up for Stag.io">
          Sign Up Free
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-16 pb-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="sun-in inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-xs font-semibold">Where Careers Blossom</span>
          </div>

          <h1 className="sun-in-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.06] tracking-tight mb-6"
            style={{ textWrap: "balance" }}>
            Your Internship{" "}
            <span className="relative inline-block">
              Journey
              <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none" aria-hidden="true">
                <path d="M0 8 Q50 0, 100 6 T200 4" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>{" "}
            Starts Here
          </h1>

          <p className="sun-in-3 mx-auto max-w-lg text-base font-light leading-relaxed mb-10"
            style={{ color: "rgba(255,255,255,0.7)" }}>
            Connect with top companies, showcase your unique skills, and navigate
            from application to official internship agreement — effortlessly.
          </p>

          <div className="sun-in-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              style={{ background: "#FFFFFF", color: "#E11D48" }}
              aria-label="Start your internship search">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300 hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)" }}
              aria-label="Post an internship offer">
              Post an Offer
            </button>
          </div>
        </div>
      </section>

      {/* --- WAVE SEPARATOR --- */}
      <div className="relative z-10 overflow-hidden" style={{ height: "80px" }} aria-hidden="true">
        <svg className="wave-anim absolute bottom-0" style={{ width: "200%", height: "80px" }} viewBox="0 0 2400 80" fill="none" preserveAspectRatio="none">
          <path d="M0 40 C200 10, 400 70, 600 40 C800 10, 1000 70, 1200 40 C1400 10, 1600 70, 1800 40 C2000 10, 2200 70, 2400 40 L2400 80 L0 80 Z"
            fill="rgba(255,255,255,0.06)" />
          <path d="M0 50 C200 25, 400 75, 600 50 C800 25, 1000 75, 1200 50 C1400 25, 1600 75, 1800 50 C2000 25, 2200 75, 2400 50 L2400 80 L0 80 Z"
            fill="rgba(255,255,255,0.04)" />
        </svg>
      </div>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-12 pt-4">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: "Student Profiles",
              desc: "Build your digital CV with skill tags, GitHub links, and portfolio. Search offers by location, tech stack, and internship type.",
            },
            {
              icon: Building2,
              title: "Company Space",
              desc: "Present your brand. Publish and manage internship offers. Track and accept candidates through a streamlined dashboard.",
            },
            {
              icon: FileText,
              title: "Auto Documents",
              desc: "Validated placements trigger automatic Convention de Stage PDF generation, pre-filled with all parties\u2019 information.",
            },
          ].map((feat, i) => (
            <div key={i} className={`sunset-card sun-in-5 rounded-2xl p-7`}>
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <feat.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.6)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24 pt-8">
        <div className="mx-auto max-w-3xl sunset-card rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "2.5K+", label: "Students" },
              { value: "350+", label: "Companies" },
              { value: "45", label: "Universities" },
              { value: "96%", label: "Placed" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
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
