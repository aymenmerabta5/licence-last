import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground ed-smooth">
      {/* ── Minimal Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6 border-b border-border ed-smooth">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl tracking-tight text-heading ed-smooth">
            Internex<span className="text-primary">.</span>io
          </span>
        </div>
      </nav>

      {/* ── 404 Content ── */}
      <div className="flex-1 relative flex items-center justify-center px-6 py-16 lg:py-24">
        {/* Ambient glow — dark mode only */}
        <div
          className="ed-hero-glow absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          {/* Edition marker */}
          <span className="text-[10px] font-medium tracking-[0.35em] uppercase text-primary mb-10">
            Missing Edition
          </span>

          {/* Top separator */}
          <div
            className="flex items-center justify-center gap-4"
            aria-hidden="true"
          >
            <span className="h-px bg-foreground/15 ed-smooth w-14" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-px bg-foreground/15 ed-smooth w-14" />
          </div>

          {/* Giant 404 */}
          <div className="mt-10 mb-6">
            <span
              className="font-serif text-heading ed-smooth ed-card-num block"
              style={{
                fontSize: "clamp(7rem, 18vw, 14rem)",
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
              }}
            >
              4
              <span className="relative inline-block">
                <span className="text-primary">0</span>
                <span
                  className="absolute -bottom-1 start-0 end-0 h-[3px] bg-primary"
                  aria-hidden="true"
                />
              </span>
              4
            </span>
          </div>

          {/* Middle separator */}
          <div
            className="flex items-center justify-center gap-4"
            aria-hidden="true"
          >
            <span className="h-px bg-foreground/15 ed-smooth w-10" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-px bg-foreground/15 ed-smooth w-10" />
          </div>

          {/* Headline */}
          <h1 className="font-serif text-2xl md:text-3xl text-heading tracking-tight mt-8 mb-4 ed-smooth">
            Page Not Found
          </h1>

          {/* Divider */}
          <div className="w-full max-w-xs mb-6">
            <div className="h-px bg-border/50 ed-smooth" />
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed font-light text-muted-foreground max-w-sm mb-10 ed-smooth">
            The article you are looking for seems to have been removed from our
            publication, renamed, or is temporarily unavailable.
          </p>

          {/* CTA Button */}
          <Link
            href="/"
            className="rounded-none inline-flex items-center justify-center gap-3 border-2 border-secondary text-secondary bg-transparent font-bold uppercase tracking-[0.15em] hover:bg-secondary hover:text-secondary-foreground ed-smooth-fast h-10 px-5 py-2.5 text-xs group"
          >
            Return to Home
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-2"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>

          {/* Bottom separator */}
          <div className="mt-14">
            <div
              className="flex items-center justify-center gap-4"
              aria-hidden="true"
            >
              <span className="h-px bg-foreground/15 ed-smooth w-5" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="h-px bg-foreground/15 ed-smooth w-5" />
            </div>
          </div>

          {/* Suggestion text */}
          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/50 mt-8 ed-smooth">
            We suggest starting from the main edition
          </p>
        </div>
      </div>
    </div>
  )
}
