"use client";

import { Crimson_Pro, Karla } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Camera, Aperture, Heart } from "lucide-react";

const crimson = Crimson_Pro({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const karla = Karla({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignPolaroid() {
  return (
    <div className={karla.className} style={{ background: "#F2E9DC", color: "#3B3228", minHeight: "100vh" }}>
      <style>{`
        @keyframes pol-tilt {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(1deg); }
        }
        @keyframes pol-tilt-2 {
          0%, 100% { transform: rotate(3deg); }
          50% { transform: rotate(-1deg); }
        }
        @keyframes pol-fade {
          from { opacity: 0; transform: translateY(15px) rotate(-1deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        .pol-in { animation: pol-fade 0.6s ease-out both; }
        .pol-in-2 { animation: pol-fade 0.6s ease-out 0.1s both; }
        .pol-in-3 { animation: pol-fade 0.6s ease-out 0.2s both; }
        .pol-in-4 { animation: pol-fade 0.6s ease-out 0.3s both; }
        .pol-in-5 { animation: pol-fade 0.6s ease-out 0.4s both; }
        .pol-tilt { animation: pol-tilt 6s ease-in-out infinite; }
        .pol-tilt-2 { animation: pol-tilt-2 7s ease-in-out infinite; }
        .polaroid-frame {
          background: #FFFEF9;
          padding: 12px 12px 40px 12px;
          box-shadow: 0 2px 8px rgba(59,50,40,0.08), 0 8px 24px rgba(59,50,40,0.06);
          transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease;
        }
        .polaroid-frame:hover {
          transform: translateY(-6px) rotate(1deg);
          box-shadow: 0 8px 24px rgba(59,50,40,0.1), 0 16px 48px rgba(59,50,40,0.08);
        }
        .vintage-overlay {
          background: linear-gradient(135deg, rgba(255,220,150,0.08), rgba(180,120,80,0.05));
        }
        @media (prefers-reduced-motion: reduce) {
          .pol-in, .pol-in-2, .pol-in-3, .pol-in-4, .pol-in-5, .pol-tilt, .pol-tilt-2 {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .polaroid-frame:hover { transform: translateY(-4px) !important; }
        }
      `}</style>

      {/* Subtle warm vignette */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(59,50,40,0.06) 100%)" }} />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6">
        <div className="flex items-center gap-2.5">
          <Aperture className="h-5 w-5" style={{ color: "#9B7B5E" }} />
          <span className={`${crimson.className} text-2xl font-light tracking-wide`} style={{ fontStyle: "italic" }}>
            Stag.io
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Gallery", "Students", "Companies", "About"].map((item) => (
            <span key={item} className="text-sm font-light cursor-pointer transition-colors duration-300"
              style={{ color: "rgba(59,50,40,0.35)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#9B7B5E")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(59,50,40,0.35)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="rounded-full px-5 py-2.5 text-xs font-medium transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          style={{ background: "#9B7B5E", color: "#FFFEF9" }}
          aria-label="Start capturing your career moments">
          Start Capturing
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-12 pb-16">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-6">
            <div className="pol-in flex items-center gap-2 mb-6">
              <Camera className="h-3.5 w-3.5" style={{ color: "#9B7B5E" }} />
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: "#9B7B5E" }}>
                Capture Every Moment
              </span>
            </div>

            <h1 className={`${crimson.className} pol-in-2`}
              style={{
                fontSize: "clamp(3rem, 6vw, 5rem)",
                lineHeight: 1.08,
                fontWeight: 300,
                fontStyle: "italic",
                color: "#3B3228",
                textWrap: "balance",
              }}>
              Your Career,{" "}
              <span style={{ fontWeight: 600, fontStyle: "normal", color: "#9B7B5E" }}>Beautifully Framed</span>
            </h1>

            <p className="pol-in-3 mt-6 max-w-sm text-sm font-light leading-relaxed"
              style={{ color: "rgba(59,50,40,0.45)" }}>
              Like the best photographs, great careers are about timing,
              composition, and connection. Frame your skills, focus your search,
              and develop your future.
            </p>

            <div className="pol-in-4 mt-8 flex items-center gap-5">
              <button className="group flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                style={{ background: "#3B3228", color: "#F2E9DC" }}
                aria-label="Start your internship search">
                Develop Now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-medium transition-all duration-300 hover:bg-[rgba(155,123,94,0.08)] focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                style={{ borderColor: "#9B7B5E", color: "#9B7B5E" }}
                aria-label="Post an offer">
                Post Offer
              </button>
            </div>
          </div>

          {/* Right: Stacked polaroid cards */}
          <div className="lg:col-span-6 relative flex items-center justify-center min-h-[400px]">
            {/* Background tilted polaroid */}
            <div className="pol-tilt polaroid-frame absolute w-[240px] cursor-pointer" style={{ transform: "rotate(-6deg)", top: "10%", left: "8%" }}>
              <div className="aspect-[4/3] rounded-sm mb-3" style={{ background: "linear-gradient(135deg, #C4654A, #E8956A)" }} />
              <div className={`${crimson.className} text-center text-sm font-light`} style={{ fontStyle: "italic", color: "rgba(59,50,40,0.5)" }}>
                Student Space
              </div>
            </div>

            {/* Middle polaroid */}
            <div className="pol-tilt-2 polaroid-frame absolute w-[240px] cursor-pointer" style={{ transform: "rotate(4deg)", top: "5%", right: "5%" }}>
              <div className="aspect-[4/3] rounded-sm mb-3" style={{ background: "linear-gradient(135deg, #7D8B6A, #A5B88F)" }} />
              <div className={`${crimson.className} text-center text-sm font-light`} style={{ fontStyle: "italic", color: "rgba(59,50,40,0.5)" }}>
                Company Portal
              </div>
            </div>

            {/* Front polaroid */}
            <div className="pol-in-3 polaroid-frame relative w-[260px] cursor-pointer z-10" style={{ transform: "rotate(-1deg)" }}>
              <div className="aspect-[4/3] rounded-sm mb-3 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #9B7B5E, #C4A882)" }}>
                <Heart className="h-10 w-10 text-white/40" />
              </div>
              <div className={`${crimson.className} text-center text-sm font-light`} style={{ fontStyle: "italic", color: "rgba(59,50,40,0.5)" }}>
                Your Perfect Match
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-16">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-6">
          {[
            { icon: GraduationCap, title: "Frame Your Skills", desc: "Build a digital portfolio with tagged competencies, GitHub links, and academic highlights. Focus on what makes you unique.", color: "#C4654A" },
            { icon: Building2, title: "Set the Scene", desc: "Present your company story. Publish roles, curate candidates, and capture the right talent for your team.", color: "#7D8B6A" },
            { icon: FileText, title: "Develop Results", desc: "Validate placements, auto-generate Convention de Stage, and watch the picture come together across institutions.", color: "#9B7B5E" },
          ].map((feat, i) => (
            <div key={i} className="polaroid-frame pol-in-5 rounded-sm cursor-pointer" style={{ padding: "24px" }}>
              <feat.icon className="h-5 w-5 mb-4" style={{ color: feat.color }} />
              <h3 className={`${crimson.className} text-xl font-medium mb-2`} style={{ fontStyle: "italic" }}>{feat.title}</h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(59,50,40,0.45)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "2,500+", label: "Exposures" },
            { value: "350+", label: "Studios" },
            { value: "45", label: "Galleries" },
            { value: "96%", label: "Developed" },
          ].map((stat, i) => (
            <div key={i} className="pol-in-5">
              <div className={`${crimson.className} text-3xl font-light mb-1`} style={{ fontStyle: "italic", color: "#3B3228" }}>
                {stat.value}
              </div>
              <div className="text-[10px] font-medium tracking-[0.2em] uppercase" style={{ color: "rgba(59,50,40,0.25)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
