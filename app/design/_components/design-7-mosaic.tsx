"use client";

import { useState } from "react";
import { Bebas_Neue, Work_Sans } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, Layers, ArrowUpRight, Sun, Moon } from "lucide-react";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

/* ═══════════════════════════════════════════════════════════════════
   Theme Palettes
   Light → "Bauhaus Workshop"  — bold color blocks on white canvas
   Dark  → "Night Gallery"     — illuminated panels in darkness
   ═══════════════════════════════════════════════════════════════════ */
const palettes = {
  light: {
    bg: "#FFFFFF",
    text: "#111111",
    navBorder: "3px solid #111",
    navItemBorder: "2px solid #111",
    navItemHoverBg: "#111",
    navItemHoverText: "#FFF",
    logoText: "#111111",
    /* Headline block */
    heroBlockBg: "#111111",
    heroBlockText: "#FFFFFF",
    heroLabel: "rgba(255,255,255,0.4)",
    heroSub: "rgba(255,255,255,0.5)",
    /* Color accent blocks — these bold colors transcend themes */
    red: "#FF3333",
    blue: "#2B44FF",
    /* Feature cards */
    yellowCardBg: "#FFCC00",
    yellowCardText: "#111",
    yellowCardBorder: "3px solid #111",
    midCardBg: "#FFF",
    midCardText: "#111",
    midCardBorder: "3px solid #111",
    midCardLabel: "#111",
    darkCardBg: "#111",
    darkCardText: "#FFF",
    darkCardBorder: "3px solid #111",
    darkCardLabel: "rgba(255,255,255,0.5)",
    darkCardDesc: "rgba(255,255,255,0.7)",
    darkCardArrow: "rgba(255,255,255,0.5)",
    /* Hover shadow */
    hoverShadow: "8px 8px 0px #111111",
    /* CTAs */
    ctaPrimaryBg: "#111",
    ctaPrimaryText: "#FFF",
    ctaPrimaryHoverShadow: "6px 6px 0px #FF3333",
    ctaSecBorder: "3px solid #111",
    ctaSecText: "#111",
    ctaSecHoverBg: "#111",
    ctaSecHoverText: "#FFF",
    /* Toggle */
    toggleBg: "#111",
    toggleText: "#FFF",
  },
  dark: {
    bg: "#0A0A0A",
    text: "#F0F0F0",
    navBorder: "3px solid rgba(255,255,255,0.12)",
    navItemBorder: "2px solid rgba(255,255,255,0.12)",
    navItemHoverBg: "#FFF",
    navItemHoverText: "#111",
    logoText: "#F0F0F0",
    /* Headline block */
    heroBlockBg: "#161616",
    heroBlockText: "#FFFFFF",
    heroLabel: "rgba(255,255,255,0.35)",
    heroSub: "rgba(255,255,255,0.45)",
    /* Color accent blocks — stay vibrant */
    red: "#FF3333",
    blue: "#2B44FF",
    /* Feature cards */
    yellowCardBg: "#FFCC00",
    yellowCardText: "#111",
    yellowCardBorder: "3px solid #FFCC00",
    midCardBg: "#181818",
    midCardText: "#F0F0F0",
    midCardBorder: "3px solid rgba(255,255,255,0.12)",
    midCardLabel: "rgba(255,255,255,0.6)",
    darkCardBg: "#1E1E1E",
    darkCardText: "#FFF",
    darkCardBorder: "3px solid rgba(255,255,255,0.08)",
    darkCardLabel: "rgba(255,255,255,0.4)",
    darkCardDesc: "rgba(255,255,255,0.6)",
    darkCardArrow: "rgba(255,255,255,0.4)",
    /* Hover shadow */
    hoverShadow: "8px 8px 0px rgba(255,51,51,0.6)",
    /* CTAs */
    ctaPrimaryBg: "#F0F0F0",
    ctaPrimaryText: "#111",
    ctaPrimaryHoverShadow: "6px 6px 0px #FF3333",
    ctaSecBorder: "3px solid rgba(255,255,255,0.2)",
    ctaSecText: "#F0F0F0",
    ctaSecHoverBg: "#FFF",
    ctaSecHoverText: "#111",
    /* Toggle */
    toggleBg: "#FFF",
    toggleText: "#111",
  },
} as const;

const TRANSITION = "background-color 0.6s cubic-bezier(0.4,0,0.2,1), color 0.5s ease";
const TRANSITION_FAST = "all 0.4s cubic-bezier(0.4,0,0.2,1)";

export function DesignMosaic() {
  const [isDark, setIsDark] = useState(false);
  const t = isDark ? palettes.dark : palettes.light;

  return (
    <div className={workSans.className} style={{ background: t.bg, color: t.text, minHeight: "100vh", transition: TRANSITION }}>
      <style>{`
        @keyframes mosaic-slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mosaic-slide-right {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes block-grow {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .mos-up { animation: mosaic-slide-up 0.6s ease-out both; }
        .mos-up-2 { animation: mosaic-slide-up 0.6s ease-out 0.08s both; }
        .mos-up-3 { animation: mosaic-slide-up 0.6s ease-out 0.16s both; }
        .mos-up-4 { animation: mosaic-slide-up 0.6s ease-out 0.24s both; }
        .mos-right { animation: mosaic-slide-right 0.5s ease-out 0.1s both; }
        .block-in { animation: block-grow 0.5s ease-out both; }
        .block-in-2 { animation: block-grow 0.5s ease-out 0.1s both; }
        .block-in-3 { animation: block-grow 0.5s ease-out 0.2s both; }
        .block-in-4 { animation: block-grow 0.5s ease-out 0.3s both; }
        .mosaic-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .mosaic-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: ${t.hoverShadow};
        }
        @media (prefers-reduced-motion: reduce) {
          .mos-up, .mos-up-2, .mos-up-3, .mos-up-4, .mos-right,
          .block-in, .block-in-2, .block-in-3, .block-in-4 {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* --- NAV --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-5"
        style={{ borderBottom: t.navBorder, transition: TRANSITION_FAST }}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center" style={{ background: t.red }}>
            <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className={`${bebas.className} text-2xl tracking-wider`} style={{ color: t.logoText, transition: "color 0.4s ease" }}>
            STAG.IO
          </span>
        </div>
        <div className="hidden md:flex items-center gap-0">
          {["PLATFORM", "STUDENTS", "COMPANIES", "CONTACT"].map((item, i) => (
            <span key={item}
              className="px-5 py-2 text-[11px] font-bold tracking-[0.12em] cursor-pointer transition-colors duration-200"
              style={{ borderLeft: i === 0 ? "none" : t.navItemBorder }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.navItemHoverBg;
                e.currentTarget.style.color = t.navItemHoverText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.text;
              }}>
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* Theme toggle — bold geometric tile */}
          <button
            onClick={() => setIsDark((v) => !v)}
            className="h-8 w-8 flex items-center justify-center transition-all duration-200 hover:translate-y-[-2px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            style={{ background: t.toggleBg, color: t.toggleText }}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
            {isDark
              ? <Sun className="h-3.5 w-3.5" />
              : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button className="px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] text-white transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
            style={{ background: t.red, boxShadow: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `4px 4px 0px ${isDark ? "#FFF" : "#111"}`)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            aria-label="Get started with Stag.io">
            GET STARTED
          </button>
        </div>
      </nav>

      {/* --- HERO: Mosaic Grid --- */}
      <section className="relative px-8 lg:px-16 pt-10 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Mosaic layout */}
          <div className="grid grid-cols-12 grid-rows-[auto] gap-4 lg:gap-5">
            {/* Large headline block */}
            <div className="col-span-12 lg:col-span-7 row-span-2 mos-up p-8 lg:p-10 flex flex-col justify-between min-h-[350px]"
              style={{ background: t.heroBlockBg, color: t.heroBlockText, transition: TRANSITION_FAST }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full" style={{ background: t.red }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: t.heroLabel }}>
                  INTERNSHIP PLATFORM
                </span>
              </div>
              <div>
                <h1 className={`${bebas.className} mos-up-2`}
                  style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "0.01em" }}>
                  CONNECT.<br />
                  <span style={{ color: t.red }}>MATCH.</span><br />
                  SUCCEED.
                </h1>
                <p className="mos-up-3 mt-6 max-w-sm text-sm font-light leading-relaxed" style={{ color: t.heroSub }}>
                  Bridging university talent with industry through skill-based matching
                  and automated internship workflows.
                </p>
              </div>
            </div>

            {/* Red accent block */}
            <div className="col-span-6 lg:col-span-5 block-in p-6 flex flex-col justify-between min-h-[170px]"
              style={{ background: t.red, color: "#FFF" }}>
              <GraduationCap className="h-6 w-6" />
              <div>
                <div className={`${bebas.className} text-4xl`}>2,500+</div>
                <div className="text-xs font-medium tracking-wider mt-1 opacity-80">STUDENTS CONNECTED</div>
              </div>
            </div>

            {/* Blue block */}
            <div className="col-span-6 lg:col-span-5 block-in-2 p-6 flex flex-col justify-between min-h-[170px]"
              style={{ background: t.blue, color: "#FFF" }}>
              <Building2 className="h-6 w-6" />
              <div>
                <div className={`${bebas.className} text-4xl`}>350+</div>
                <div className="text-xs font-medium tracking-wider mt-1 opacity-80">PARTNER COMPANIES</div>
              </div>
            </div>

            {/* Yellow feature block */}
            <div className="col-span-12 lg:col-span-4 block-in-3 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: t.yellowCardBg, color: t.yellowCardText, border: t.yellowCardBorder, transition: TRANSITION_FAST }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]">01 — STUDENT SPACE</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium leading-snug mt-4">
                Build your digital CV with skill tags, GitHub integration, and smart internship search filters.
              </p>
            </div>

            {/* Middle feature block */}
            <div className="col-span-12 lg:col-span-4 block-in-3 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: t.midCardBg, color: t.midCardText, border: t.midCardBorder, transition: TRANSITION_FAST }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: t.midCardLabel }}>
                  02 — COMPANY PORTAL
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium leading-snug mt-4">
                Publish offers, track candidates, and accept talent. One click triggers the full administrative workflow.
              </p>
            </div>

            {/* Dark feature block */}
            <div className="col-span-12 lg:col-span-4 block-in-4 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: t.darkCardBg, color: t.darkCardText, border: t.darkCardBorder, transition: TRANSITION_FAST }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: t.darkCardLabel }}>03 — ADMIN HUB</span>
                <ArrowUpRight className="h-4 w-4" style={{ color: t.darkCardArrow }} />
              </div>
              <p className="text-sm font-medium leading-snug mt-4" style={{ color: t.darkCardDesc }}>
                Validate placements, auto-generate official Convention de Stage PDFs, and track placement statistics.
              </p>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button className="group flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              style={{ background: t.ctaPrimaryBg, color: t.ctaPrimaryText, boxShadow: "none", transition: TRANSITION_FAST }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = t.ctaPrimaryHoverShadow)}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              aria-label="Explore the platform">
              EXPLORE PLATFORM
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all duration-200 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
              style={{ border: t.ctaSecBorder, color: t.ctaSecText, transition: TRANSITION_FAST }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = t.ctaSecHoverBg;
                e.currentTarget.style.color = t.ctaSecHoverText;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.ctaSecText;
              }}
              aria-label="Post an internship offer">
              POST AN OFFER
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
