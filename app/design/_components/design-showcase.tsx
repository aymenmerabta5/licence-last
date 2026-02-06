"use client";

import { useState } from "react";
import { DesignConstellation } from "./design-1-constellation";
import { DesignEditorial } from "./design-2-editorial";
import { DesignBrutalist } from "./design-3-brutalist";
import { DesignAurora } from "./design-4-aurora";
import { DesignDeco } from "./design-5-deco";
import { DesignPlayful } from "./design-6-playful";
import { DesignMosaic } from "./design-7-mosaic";
import { DesignSynthwave } from "./design-8-synthwave";
import { DesignPaper } from "./design-9-paper";
import { DesignInk } from "./design-10-ink";
import { DesignNeon } from "./design-11-neon";
import { DesignSunset } from "./design-12-sunset";
import { DesignBlueprint } from "./design-13-blueprint";
import { DesignNoir } from "./design-14-noir";
import { DesignTerrazzo } from "./design-15-terrazzo";
import { DesignTopo } from "./design-16-topo";
import { DesignPolaroid } from "./design-17-polaroid";
import { DesignHolo } from "./design-18-holo";
import { DesignStainedGlass } from "./design-19-stained-glass";
import { DesignChalkboard } from "./design-20-chalkboard";
import { DesignBauhaus } from "./design-21-bauhaus";
import { DesignClassified } from "./design-22-classified";
import { DesignNeonSign } from "./design-23-neon-sign";
import { DesignRiso } from "./design-24-riso";

const designs = [
  { id: 1, label: "Constellation", subtitle: "Dark Sci-Fi", component: DesignConstellation },
  { id: 2, label: "Editorial", subtitle: "Magazine Press", component: DesignEditorial },
  { id: 3, label: "Terminal", subtitle: "Brutalist Dev", component: DesignBrutalist },
  { id: 4, label: "Aurora Glass", subtitle: "Glassmorphism", component: DesignAurora },
  { id: 5, label: "Deco Luxe", subtitle: "Art Deco", component: DesignDeco },
  { id: 6, label: "Candy Pop", subtitle: "Playful Vibrant", component: DesignPlayful },
  { id: 7, label: "Mosaic", subtitle: "Color Blocks", component: DesignMosaic },
  { id: 8, label: "Synthwave", subtitle: "Retro Future", component: DesignSynthwave },
  { id: 9, label: "Paper Layers", subtitle: "Material Depth", component: DesignPaper },
  { id: 10, label: "Ink & Wash", subtitle: "Zen Minimal", component: DesignInk },
  { id: 11, label: "Neon Grid", subtitle: "Cyberpunk", component: DesignNeon },
  { id: 12, label: "Sunset Flow", subtitle: "Warm Waves", component: DesignSunset },
  { id: 13, label: "Blueprint", subtitle: "Technical Draft", component: DesignBlueprint },
  { id: 14, label: "Film Noir", subtitle: "Cinematic B&W", component: DesignNoir },
  { id: 15, label: "Terrazzo", subtitle: "Memphis Pop", component: DesignTerrazzo },
  { id: 16, label: "Topographic", subtitle: "Terrain Map", component: DesignTopo },
  { id: 17, label: "Polaroid", subtitle: "Analog Warm", component: DesignPolaroid },
  { id: 18, label: "Holographic", subtitle: "Iridescent Foil", component: DesignHolo },
  { id: 19, label: "Stained Glass", subtitle: "Cathedral Light", component: DesignStainedGlass },
  { id: 20, label: "Chalkboard", subtitle: "Classroom Chalk", component: DesignChalkboard },
  { id: 21, label: "Bauhaus", subtitle: "Geometric School", component: DesignBauhaus },
  { id: 22, label: "Classified", subtitle: "Newspaper Ads", component: DesignClassified },
  { id: 23, label: "Neon Sign", subtitle: "Tube Glow", component: DesignNeonSign },
  { id: 24, label: "Risograph", subtitle: "Print Zine", component: DesignRiso },
] as const;

export function DesignShowcase() {
  const [activeDesign, setActiveDesign] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const ActiveComponent = designs.find((d) => d.id === activeDesign)?.component ?? DesignConstellation;
  const activeMeta = designs.find((d) => d.id === activeDesign);

  return (
    <div className="min-h-screen bg-neutral-950">
      <ActiveComponent />

      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
        {expanded && (
          <div
            className="rounded-2xl border p-3 shadow-2xl"
            style={{
              background: "rgba(10,10,15,0.88)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "rgba(255,255,255,0.08)",
              animation: "switcher-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            <style>{`
              @keyframes switcher-pop {
                from { opacity: 0; transform: scale(0.9) translateY(8px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
              @media (prefers-reduced-motion: reduce) {
                .switcher-pop { animation: none !important; }
              }
            `}</style>

            <div className="flex items-center justify-between px-1.5 pb-2.5 mb-1"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                Design Explorations
              </span>
              <span className="text-[10px] font-bold"
                style={{ color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>
                {activeDesign}/{designs.length}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {designs.map((d) => {
                const isActive = activeDesign === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDesign(d.id);
                      setExpanded(false);
                    }}
                    aria-label={`Design ${d.id}: ${d.label} — ${d.subtitle}`}
                    title={`${d.label} — ${d.subtitle}`}
                    className="group relative flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
                    style={{
                      width: 38,
                      height: 38,
                      color: isActive ? "#000" : "rgba(255,255,255,0.45)",
                      background: isActive ? "#fff" : "rgba(255,255,255,0.04)",
                      border: isActive ? "none" : "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                      }
                    }}
                  >
                    {d.id}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Close design switcher" : "Open design switcher"}
          className="flex items-center gap-3 rounded-full border py-2.5 pl-4 pr-3 shadow-2xl transition-all duration-300 hover:scale-105 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          style={{
            background: "rgba(10,10,15,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-white text-[11px] font-bold text-black"
              style={{ fontVariantNumeric: "tabular-nums" }}>
              {activeDesign}
            </span>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-none">{activeMeta?.label}</div>
              <div className="text-[10px] leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                {activeMeta?.subtitle}
              </div>
            </div>
          </div>
          <svg className="h-4 w-4 transition-transform duration-200"
            style={{ color: "rgba(255,255,255,0.4)", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
