"use client";

import { Lora, Source_Sans_3 } from "next/font/google";
import { ArrowRight, GraduationCap, Building2, FileText, Leaf, ChevronRight, BookOpen } from "lucide-react";

const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const sourceSans = Source_Sans_3({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export function DesignPaper() {
  return (
    <div className={sourceSans.className} style={{ background: "#EDE6D6", color: "#3D3024", minHeight: "100vh" }}>
      <style>{`
        @keyframes paper-lift {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .paper { animation: paper-lift 0.6s ease-out both; }
        .paper-2 { animation: paper-lift 0.6s ease-out 0.08s both; }
        .paper-3 { animation: paper-lift 0.6s ease-out 0.16s both; }
        .paper-4 { animation: paper-lift 0.6s ease-out 0.24s both; }
        .paper-5 { animation: paper-lift 0.6s ease-out 0.32s both; }
        .paper-card {
          background: #FAF6ED;
          box-shadow: 0 1px 3px rgba(61,48,36,0.06), 0 6px 16px rgba(61,48,36,0.04);
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
        }
        .paper-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 4px 12px rgba(61,48,36,0.08), 0 20px 48px rgba(61,48,36,0.08);
        }
        .paper-elevated {
          background: #FAF6ED;
          box-shadow: 0 2px 8px rgba(61,48,36,0.05), 0 12px 32px rgba(61,48,36,0.06);
        }
        .paper-deep {
          background: #F5F0E4;
          box-shadow: 0 1px 2px rgba(61,48,36,0.04), 0 4px 12px rgba(61,48,36,0.03);
        }
        @media (prefers-reduced-motion: reduce) {
          .paper, .paper-2, .paper-3, .paper-4, .paper-5 {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .paper-card:hover { transform: none; }
        }
      `}</style>

      {/* Subtle paper texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.65' numOctaves='3' type='fractalNoise'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

      {/* --- NAV --- */}
      <nav className="relative z-20 px-8 lg:px-16 pt-6 pb-6">
        <div className="paper-elevated mx-auto max-w-6xl flex items-center justify-between rounded-2xl px-8 py-4">
          <div className="flex items-center gap-2.5">
            <Leaf className="h-5 w-5" style={{ color: "#7D8B6A" }} />
            <span className={`${lora.className} text-xl font-semibold tracking-tight`}>Stag.io</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Discover", "Students", "Companies", "About"].map((item) => (
              <span key={item} className="text-sm font-medium cursor-pointer transition-colors duration-200"
                style={{ color: "rgba(61,48,36,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#C4654A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(61,48,36,0.4)")}>
                {item}
              </span>
            ))}
          </div>
          <button className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
            style={{ background: "#C4654A" }}
            aria-label="Get started with Stag.io">
            Get Started
          </button>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative z-10 px-8 lg:px-16 pt-10 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Main content card */}
            <div className="lg:col-span-7 paper-elevated rounded-3xl p-10 lg:p-14 paper">
              <div className="flex items-center gap-2 mb-8">
                <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#C4654A" }} />
                <span className="text-xs font-semibold tracking-[0.12em] uppercase" style={{ color: "#7D8B6A" }}>
                  Internship Platform
                </span>
              </div>

              <h1 className={`${lora.className} paper-2`}
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  lineHeight: 1.12,
                  fontWeight: 600,
                  color: "#3D3024",
                  textWrap: "balance",
                }}>
                Your Bridge to{" "}
                <span style={{ color: "#C4654A" }}>Professional Growth</span>
              </h1>

              <p className="paper-3 mt-6 max-w-md text-base font-light leading-relaxed" style={{ color: "rgba(61,48,36,0.55)" }}>
                A thoughtfully designed platform connecting university students with industry
                partners through skill-based matching and streamlined administrative workflows.
              </p>

              <div className="paper-4 mt-8 flex flex-col sm:flex-row items-start gap-4">
                <button className="group flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
                  style={{ background: "#C4654A" }}
                  aria-label="Start exploring internships">
                  Start Exploring
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <button className="group flex items-center gap-2 rounded-xl border-2 px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:bg-[#7D8B6A] hover:text-white hover:border-[#7D8B6A] focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:outline-none"
                  style={{ borderColor: "#7D8B6A", color: "#7D8B6A" }}
                  aria-label="Post an internship offer">
                  Post an Offer
                </button>
              </div>
            </div>

            {/* Stacked side cards */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {[
                { icon: GraduationCap, label: "Students Connected", value: "2,500+", bg: "#C4654A" },
                { icon: Building2, label: "Partner Companies", value: "350+", bg: "#7D8B6A" },
                { icon: BookOpen, label: "Placement Rate", value: "96%", bg: "#B5945B" },
              ].map((stat, i) => (
                <div key={i} className={`paper-card rounded-2xl p-6 flex items-center gap-5 paper-${i + 2} cursor-pointer`}>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${stat.bg}15` }}>
                    <stat.icon className="h-5 w-5" style={{ color: stat.bg }} />
                  </div>
                  <div>
                    <div className={`${lora.className} text-2xl font-semibold`}>{stat.value}</div>
                    <div className="text-xs font-medium" style={{ color: "rgba(61,48,36,0.4)" }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative z-10 px-8 lg:px-16 pb-24">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: "Student Space",
              desc: "Build a digital CV with tagged skills, link your GitHub and portfolio. Search internships by region, technology, or type with smart filters.",
              accent: "#C4654A",
            },
            {
              icon: Building2,
              title: "Company Portal",
              desc: "Create your company page with logo and description. Publish, edit, and manage offers. Track and accept candidates through an intuitive dashboard.",
              accent: "#7D8B6A",
            },
            {
              icon: FileText,
              title: "Admin Dashboard",
              desc: "Validate internship placements with a single click. Auto-generate pre-filled Convention de Stage PDFs. Access global placement statistics.",
              accent: "#B5945B",
            },
          ].map((feat, i) => (
            <div key={i} className="paper-card rounded-2xl p-8 paper-5 cursor-pointer">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${feat.accent}12` }}>
                <feat.icon className="h-5 w-5" style={{ color: feat.accent }} />
              </div>
              <h3 className={`${lora.className} text-lg font-semibold mb-3`}>{feat.title}</h3>
              <p className="text-sm leading-relaxed font-light" style={{ color: "rgba(61,48,36,0.5)" }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
