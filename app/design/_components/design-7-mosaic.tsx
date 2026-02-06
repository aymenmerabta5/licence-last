"use client";

import { Bebas_Neue, Work_Sans } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Layers, ArrowUpRight } from "lucide-react";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: ["400"] });
const workSans = Work_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export function DesignMosaic() {
  return (
    <div className={workSans.className} style={{ background: "#FFFFFF", color: "#111111", minHeight: "100vh" }}>
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
          box-shadow: 8px 8px 0px #111111;
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
        style={{ borderBottom: "3px solid #111" }}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center" style={{ background: "#FF3333" }}>
            <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className={`${bebas.className} text-2xl tracking-wider`}>STAG.IO</span>
        </div>
        <div className="hidden md:flex items-center gap-0">
          {["PLATFORM", "STUDENTS", "COMPANIES", "CONTACT"].map((item, i) => (
            <span key={item} className="px-5 py-2 text-[11px] font-bold tracking-[0.12em] cursor-pointer transition-colors duration-200 hover:bg-[#111] hover:text-white"
              style={{ borderLeft: i === 0 ? "none" : "2px solid #111" }}>
              {item}
            </span>
          ))}
        </div>
        <button className="px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] text-white transition-all duration-200 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#111] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
          style={{ background: "#FF3333" }}
          aria-label="Get started with Stag.io">
          GET STARTED
        </button>
      </nav>

      {/* --- HERO: Mosaic Grid --- */}
      <section className="relative px-8 lg:px-16 pt-10 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* Mosaic layout */}
          <div className="grid grid-cols-12 grid-rows-[auto] gap-4 lg:gap-5">
            {/* Large headline block */}
            <div className="col-span-12 lg:col-span-7 row-span-2 mos-up p-8 lg:p-10 flex flex-col justify-between min-h-[350px]"
              style={{ background: "#111111", color: "#FFFFFF" }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-2 w-2 rounded-full" style={{ background: "#FF3333" }} />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
                  INTERNSHIP PLATFORM
                </span>
              </div>
              <div>
                <h1 className={`${bebas.className} mos-up-2`}
                  style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)", lineHeight: 0.92, letterSpacing: "0.01em" }}>
                  CONNECT.<br />
                  <span style={{ color: "#FF3333" }}>MATCH.</span><br />
                  SUCCEED.
                </h1>
                <p className="mos-up-3 mt-6 max-w-sm text-sm font-light leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Bridging university talent with industry through skill-based matching
                  and automated internship workflows.
                </p>
              </div>
            </div>

            {/* Red accent block */}
            <div className="col-span-6 lg:col-span-5 block-in p-6 flex flex-col justify-between min-h-[170px]"
              style={{ background: "#FF3333", color: "#FFF" }}>
              <GraduationCap className="h-6 w-6" />
              <div>
                <div className={`${bebas.className} text-4xl`}>2,500+</div>
                <div className="text-xs font-medium tracking-wider mt-1 opacity-80">STUDENTS CONNECTED</div>
              </div>
            </div>

            {/* Blue block */}
            <div className="col-span-6 lg:col-span-5 block-in-2 p-6 flex flex-col justify-between min-h-[170px]"
              style={{ background: "#2B44FF", color: "#FFF" }}>
              <Building2 className="h-6 w-6" />
              <div>
                <div className={`${bebas.className} text-4xl`}>350+</div>
                <div className="text-xs font-medium tracking-wider mt-1 opacity-80">PARTNER COMPANIES</div>
              </div>
            </div>

            {/* Yellow feature block */}
            <div className="col-span-12 lg:col-span-4 block-in-3 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: "#FFCC00", color: "#111", border: "3px solid #111" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]">01 — STUDENT SPACE</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium leading-snug mt-4">
                Build your digital CV with skill tags, GitHub integration, and smart internship search filters.
              </p>
            </div>

            {/* White feature block with black border */}
            <div className="col-span-12 lg:col-span-4 block-in-3 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: "#FFF", color: "#111", border: "3px solid #111" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]">02 — COMPANY PORTAL</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium leading-snug mt-4">
                Publish offers, track candidates, and accept talent. One click triggers the full administrative workflow.
              </p>
            </div>

            {/* Black feature block */}
            <div className="col-span-12 lg:col-span-4 block-in-4 p-7 flex flex-col justify-between min-h-[180px] mosaic-card cursor-pointer"
              style={{ background: "#111", color: "#FFF", border: "3px solid #111" }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.15em]" style={{ color: "rgba(255,255,255,0.5)" }}>03 — ADMIN HUB</span>
                <ArrowUpRight className="h-4 w-4" style={{ color: "rgba(255,255,255,0.5)" }} />
              </div>
              <p className="text-sm font-medium leading-snug mt-4" style={{ color: "rgba(255,255,255,0.7)" }}>
                Validate placements, auto-generate official Convention de Stage PDFs, and track placement statistics.
              </p>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button className="group flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:translate-x-[-3px] hover:translate-y-[-3px] hover:shadow-[6px_6px_0px_#FF3333] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
              style={{ background: "#111" }}
              aria-label="Explore the platform">
              EXPLORE PLATFORM
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <button className="group flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] transition-all duration-200 hover:bg-[#111] hover:text-white focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
              style={{ border: "3px solid #111" }}
              aria-label="Post an internship offer">
              POST AN OFFER
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
