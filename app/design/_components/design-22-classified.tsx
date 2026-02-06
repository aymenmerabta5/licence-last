"use client";

import { Old_Standard_TT, Courier_Prime } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Newspaper, Star } from "lucide-react";

const oldStandard = Old_Standard_TT({ subsets: ["latin"], weight: ["400", "700"] });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"] });

export function DesignClassified() {
  return (
    <div className={oldStandard.className} style={{ background: "#F5ECD7", color: "#2C2416", minHeight: "100vh" }}>
      <style>{`
        @keyframes cl-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .cl-in { animation: cl-fade 0.6s ease-out both; }
        .cl-in-2 { animation: cl-fade 0.6s ease-out 0.1s both; }
        .cl-in-3 { animation: cl-fade 0.6s ease-out 0.2s both; }
        .cl-in-4 { animation: cl-fade 0.6s ease-out 0.3s both; }
        .cl-box {
          border: 1px solid rgba(44,36,22,0.15);
          transition: background 0.3s ease, transform 0.2s ease;
        }
        .cl-box:hover {
          background: rgba(44,36,22,0.03);
          transform: scale(1.01);
        }
        @media (prefers-reduced-motion: reduce) {
          .cl-in, .cl-in-2, .cl-in-3, .cl-in-4 {
            animation: none !important; opacity: 1 !important;
          }
        }
      `}</style>

      {/* Aged paper texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence baseFrequency='0.7' numOctaves='4' type='fractalNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
        }} />

      {/* --- MASTHEAD --- */}
      <header className="relative z-20 px-6 lg:px-12 pt-6 pb-0">
        <div className="mx-auto max-w-5xl text-center cl-in"
          style={{ borderBottom: "4px double rgba(44,36,22,0.3)", paddingBottom: "12px" }}>
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="h-px flex-1 max-w-[100px]" style={{ background: "rgba(44,36,22,0.2)" }} />
            <Newspaper className="h-4 w-4" style={{ color: "rgba(44,36,22,0.3)" }} />
            <div className="h-px flex-1 max-w-[100px]" style={{ background: "rgba(44,36,22,0.2)" }} />
          </div>
          <h2 className="text-6xl sm:text-7xl font-bold tracking-tight" style={{ fontVariant: "small-caps" }}>
            The Stag.io Gazette
          </h2>
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className={`${courier.className} text-[10px]`} style={{ color: "rgba(44,36,22,0.4)" }}>
              VOL. CXXV &bull; NO. 1
            </span>
            <span className={`${courier.className} text-[10px]`} style={{ color: "rgba(44,36,22,0.4)" }}>
              FEBRUARY 6, 2026
            </span>
            <span className={`${courier.className} text-[10px]`} style={{ color: "rgba(44,36,22,0.4)" }}>
              PRICE: FREE
            </span>
          </div>
        </div>
      </header>

      {/* --- NAV (small links below masthead) --- */}
      <nav className="relative z-20 px-6 lg:px-12 py-3"
        style={{ borderBottom: "1px solid rgba(44,36,22,0.12)" }}>
        <div className="mx-auto max-w-5xl flex items-center justify-center gap-8">
          {["Classifieds", "Help Wanted", "Notices", "About"].map((item) => (
            <span key={item} className={`${courier.className} text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors duration-200 hover:text-[#8B0000]`}
              style={{ color: "rgba(44,36,22,0.35)" }}>
              {item}
            </span>
          ))}
        </div>
      </nav>

      {/* --- HERO: Newspaper front page --- */}
      <section className="relative z-10 px-6 lg:px-12 pt-8 pb-12">
        <div className="mx-auto max-w-5xl grid lg:grid-cols-12 gap-0">
          {/* Main headline column */}
          <div className="lg:col-span-8 cl-in-2 pr-0 lg:pr-8" style={{ borderRight: "1px solid rgba(44,36,22,0.1)" }}>
            <div className="mb-4">
              <span className={`${courier.className} text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1`}
                style={{ background: "#8B0000", color: "#F5ECD7" }}>
                BREAKING
              </span>
            </div>

            <h1 className="cl-in-2 text-4xl sm:text-5xl font-bold leading-[1.08] mb-4"
              style={{ fontVariant: "small-caps" }}>
              University-Enterprise Platform Launches,
              Promises to End Internship Bureaucracy
            </h1>

            <div className="h-px mb-4" style={{ background: "rgba(44,36,22,0.12)" }} />

            <div className="grid grid-cols-2 gap-6">
              <p className="text-sm leading-[1.8]" style={{ color: "rgba(44,36,22,0.6)" }}>
                In a move set to transform the internship landscape, a new
                centralized platform has emerged, connecting students with
                companies through an innovative skill-based matching system.
                The platform, dubbed &ldquo;Stag.io,&rdquo; automates the entire
                workflow from discovery to official Convention de Stage.
              </p>
              <p className="text-sm leading-[1.8]" style={{ color: "rgba(44,36,22,0.6)" }}>
                Developed within the framework of the Ministry&apos;s strategy
                to strengthen the University-Enterprise link, the system offers
                digital CV creation, smart search filters, and automated
                document generation. Over 2,500 students are already registered
                across 45 universities.
              </p>
            </div>

            <button className={`${courier.className} group flex items-center gap-2 mt-6 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:bg-[#2C2416] hover:text-[#F5ECD7] focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none`}
              style={{ border: "2px solid #2C2416" }}
              aria-label="Read the full story">
              READ FULL STORY
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Sidebar: classified ads */}
          <div className="lg:col-span-4 pl-0 lg:pl-6 mt-8 lg:mt-0">
            <div className="cl-in-3 mb-4 pb-2" style={{ borderBottom: "2px solid #2C2416" }}>
              <h3 className={`${courier.className} text-xs font-bold uppercase tracking-[0.15em]`}>
                CLASSIFIED ADVERTISEMENTS
              </h3>
            </div>

            {[
              { tag: "HELP WANTED", title: "Skilled React Developer", desc: "Company seeks talented student for 6-month internship. Apply via Stag.io.", icon: Building2 },
              { tag: "SEEKING", title: "Internship in Data Science", desc: "L3 student with Python, ML skills seeks placement. GitHub: linked.", icon: GraduationCap },
              { tag: "NOTICE", title: "Convention de Stage", desc: "Auto-generated. Pre-filled. Official. No more paper forms.", icon: FileText },
            ].map((ad, i) => (
              <div key={i} className="cl-box cl-in-4 p-4 mb-3 cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${courier.className} text-[8px] font-bold tracking-wider px-1.5 py-0.5`}
                    style={{ background: "rgba(44,36,22,0.08)", color: "rgba(44,36,22,0.5)" }}>
                    {ad.tag}
                  </span>
                </div>
                <h4 className="text-base font-bold mb-1" style={{ fontVariant: "small-caps" }}>{ad.title}</h4>
                <p className={`${courier.className} text-[11px] leading-relaxed`} style={{ color: "rgba(44,36,22,0.5)" }}>{ad.desc}</p>
              </div>
            ))}

            <button className={`${courier.className} w-full py-3 text-[10px] font-bold uppercase tracking-wider text-center transition-colors duration-200 hover:bg-[#8B0000] hover:text-[#F5ECD7] focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none`}
              style={{ border: "1px solid rgba(44,36,22,0.2)" }}
              aria-label="Place your own classified ad">
              PLACE YOUR AD &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="relative z-10 px-6 lg:px-12 pb-16">
        <div className="mx-auto max-w-5xl" style={{ borderTop: "4px double rgba(44,36,22,0.2)", borderBottom: "4px double rgba(44,36,22,0.2)" }}>
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { value: "2,500+", label: "Subscribers" },
              { value: "350+", label: "Advertisers" },
              { value: "45", label: "Districts" },
              { value: "96%", label: "Satisfaction" },
            ].map((s, i) => (
              <div key={i} className="py-5 text-center" style={{ borderRight: i < 3 ? "1px solid rgba(44,36,22,0.1)" : "none" }}>
                <div className="text-2xl font-bold mb-0.5" style={{ fontVariant: "small-caps" }}>{s.value}</div>
                <div className={`${courier.className} text-[9px] font-bold tracking-[0.15em] uppercase`} style={{ color: "rgba(44,36,22,0.3)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
