import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = ["Discover", "For Students", "For Recruiters", "About"]

export function Navbar() {
  return (
    <nav
      className="relative z-20 flex items-center justify-between px-8 lg:px-16 pt-6 pb-6 border-b border-border ed-smooth"
      aria-label="Main navigation"
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl tracking-tight text-heading ed-smooth">
          Internex<span className="text-primary">.</span>io
        </span>
      </div>

      {/* ── Nav Links ── */}
      <div className="hidden md:flex items-center gap-10">
        {NAV_ITEMS.map((item) => (
          <span
            key={item}
            className="relative text-sm font-medium tracking-wide cursor-pointer text-foreground/45 hover:text-primary transition-colors duration-300"
          >
            {item}
          </span>
        ))}
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Button
          variant="editorial"
          size="editorial-sm"
          aria-label="Get started with Stag.io"
        >
          Get Started
        </Button>
      </div>
    </nav>
  )
}
