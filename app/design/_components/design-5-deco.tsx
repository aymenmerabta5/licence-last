"use client";

import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, Award, FileText, Star, ChevronRight } from "lucide-react";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignDeco() {
  return (
    <div className={josefin.className} style={{ background: "#0D2818", color: "#F5F0E8", minHeight: "100vh" }}>
      <style>{`
        @keyframes deco-reveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gold-shine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes deco-line-grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        .deco-in { animation: deco-reveal 0.7s ease-out both; }
        .deco-in-2 { animation: deco-reveal 0.7s ease-out 0.12s both; }
        .deco-in-3 { animation: deco-reveal 0.7s ease-out 0.24s both; }
        .deco-in-4 { animation: deco-reveal 0.7s ease-out 0.36s both; }
        .gold-shine {
          background: linear-gradient(90deg, #D4A853 0%, #F5DEB3 40%, #D4A853 60%, #B8860B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gold-shine 4s linear infinite;
        }
        .gold-border { border-color: rgba(212,168,83,0.3); }
        .gold-border-strong { border-color: rgba(212,168,83,0.6); }
        .deco-pattern {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(212,168,83,0.04) 10px,
            rgba(212,168,83,0.04) 11px
          );
        }
        .deco-chevron::before,
        .deco-chevron::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 30px;
          height: 1px;
          background: rgba(212,168,83,0.4);
        }
        .deco-chevron::before { left: -40px; }
        .deco-chevron::after { right: -40px; }
        @media (prefers-reduced-motion: reduce) {
          .deco-in, .deco-in-2, .deco-in-3, .deco-in-4,
          .gold-shine { animation: none !important; opacity: 1 !important; transform: none !important; }
          .gold-shine {
            -webkit-text-fill-color: #D4A853;
            background: none;
          }
        }
      `}</style>

      {/* Deco pattern overlay */}
      <div className="deco-pattern fixed inset-0 pointer-events-none" aria-hidden="true" />

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6"
        style={{ borderBottom: "1px solid rgba(212,168,83,0.15)" }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="h-px w-6" style={{ background: "#D4A853" }} />
            <Award className="h-5 w-5" style={{ color: "#D4A853" }} />
            <div className="h-px w-6" style={{ background: "#D4A853" }} />
          </div>
          <span className={`${cormorant.className} text-2xl font-semibold tracking-wider`}>
            STAG<span style={{ color: "#D4A853" }}>.</span>IO
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {["Platform", "Students", "Partners", "Contact"].map((item) => (
            <span key={item} className="text-xs font-light uppercase tracking-[0.2em] cursor-pointer transition-colors duration-300"
              style={{ color: "rgba(245,240,232,0.4)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#D4A853")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.4)")}>
              {item}
            </span>
          ))}
        </div>
        <button className="border px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[#D4A853] hover:text-[#0D2818] hover:border-[#D4A853] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          style={{ borderColor: "rgba(212,168,83,0.4)", color: "#D4A853" }}
          aria-label="Enter the Stag.io platform">
          Enter
        </button>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-20 pb-24">
        <div className="mx-auto max-w-5xl text-center">
          {/* Decorative top element */}
          <div className="deco-in flex items-center justify-center gap-4 mb-10">
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to right, transparent, rgba(212,168,83,0.4))" }} />
            <Star className="h-4 w-4" style={{ color: "#D4A853" }} aria-hidden="true" />
            <span className="text-xs font-light uppercase tracking-[0.3em]" style={{ color: "#D4A853" }}>
              Est. 2025
            </span>
            <Star className="h-4 w-4" style={{ color: "#D4A853" }} aria-hidden="true" />
            <div className="h-px flex-1 max-w-[80px]" style={{ background: "linear-gradient(to left, transparent, rgba(212,168,83,0.4))" }} />
          </div>

          {/* Headline */}
          <h1 className={`${cormorant.className} deco-in-2`}
            style={{
              fontSize: "clamp(3rem, 7vw, 6rem)",
              lineHeight: 1.05,
              fontWeight: 300,
              letterSpacing: "0.02em",
              textWrap: "balance",
            }}>
            Excellence in{" "}
            <span className="gold-shine font-semibold">
              Career Connections
            </span>
          </h1>

          {/* Decorative divider */}
          <div className="deco-in-3 flex items-center justify-center gap-3 my-10">
            <div className="h-px w-16" style={{ background: "rgba(212,168,83,0.3)" }} />
            <div className="h-3 w-3 rotate-45 border" style={{ borderColor: "rgba(212,168,83,0.4)" }} />
            <div className="h-px w-16" style={{ background: "rgba(212,168,83,0.3)" }} />
          </div>

          <p className="deco-in-3 mx-auto max-w-lg text-sm font-light leading-relaxed tracking-wide"
            style={{ color: "rgba(245,240,232,0.5)" }}>
            An exclusive platform connecting university talent with distinguished enterprises.
            Automated internship agreements, skill-based matching, and comprehensive
            placement management&mdash;refined for the modern era.
          </p>

          {/* CTAs */}
          <div className="deco-in-4 flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
            <button className="group flex items-center gap-3 px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,168,83,0.15)] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              style={{ background: "#D4A853", color: "#0D2818" }}
              aria-label="Begin your journey">
              Begin Your Journey
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-3 border px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 hover:bg-[rgba(212,168,83,0.08)] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              style={{ borderColor: "rgba(212,168,83,0.3)", color: "#D4A853" }}
              aria-label="Partner with us">
              Partner With Us
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-20">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
          {[
            {
              icon: GraduationCap,
              num: "I",
              title: "Student Atelier",
              desc: "Craft your digital curriculum vitae. Showcase technical proficiencies, academic achievements, and portfolio works with refined precision.",
            },
            {
              icon: Building2,
              num: "II",
              title: "Enterprise Suite",
              desc: "Present your establishment with distinction. Curate internship opportunities, evaluate candidates, and initiate formal placement procedures.",
            },
            {
              icon: FileText,
              num: "III",
              title: "Administration",
              desc: "Oversee placements with authority. Validate agreements, generate official Convention de Stage documents, and monitor institutional statistics.",
            },
          ].map((feat, i) => (
            <div key={i} className="relative border p-8 text-center transition-all duration-500 group cursor-pointer"
              style={{ borderColor: "rgba(212,168,83,0.12)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.35)";
                e.currentTarget.style.background = "rgba(212,168,83,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(212,168,83,0.12)";
                e.currentTarget.style.background = "transparent";
              }}>
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: "#D4A853" }} aria-hidden="true" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t border-r" style={{ borderColor: "#D4A853" }} aria-hidden="true" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l" style={{ borderColor: "#D4A853" }} aria-hidden="true" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: "#D4A853" }} aria-hidden="true" />

              <div className={`${cormorant.className} text-3xl font-light mb-4`} style={{ color: "#D4A853" }}>
                {feat.num}
              </div>
              <feat.icon className="mx-auto h-6 w-6 mb-4" style={{ color: "rgba(212,168,83,0.5)" }} />
              <h3 className={`${cormorant.className} text-xl font-semibold tracking-wide mb-3`}>{feat.title}</h3>
              <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(245,240,232,0.45)" }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- STATS --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px flex-1" style={{ background: "rgba(212,168,83,0.2)" }} />
            <span className="text-xs font-light uppercase tracking-[0.3em]" style={{ color: "rgba(212,168,83,0.5)" }}>
              By the Numbers
            </span>
            <div className="h-px flex-1" style={{ background: "rgba(212,168,83,0.2)" }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2,500+", label: "Scholars" },
              { value: "350+", label: "Enterprises" },
              { value: "45", label: "Institutions" },
              { value: "96%", label: "Placed" },
            ].map((stat, i) => (
              <div key={i}>
                <div className={`${cormorant.className} text-4xl font-light mb-2`} style={{ color: "#D4A853" }}>
                  {stat.value}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: "rgba(245,240,232,0.3)" }}>
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
