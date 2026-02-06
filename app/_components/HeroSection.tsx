import * as motion from "motion/react-client"
import { ArrowRight, GraduationCap, Building2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardHeader,
  CardAction,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

/* ── Shared reveal transition ── */
const reveal = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

/* ── Feature card data ── */
const FEATURES: {
  num: string
  title: string
  desc: string
  icon: LucideIcon
}[] = [
  {
    num: "01",
    title: "Student Space",
    desc: "Build your profile, tag skills, connect GitHub. Search and apply with smart filters.",
    icon: GraduationCap,
  },
  {
    num: "02",
    title: "Company Portal",
    desc: "Publish offers, track candidates, accept talent. One click triggers the full workflow.",
    icon: Building2,
  },
  {
    num: "03",
    title: "Admin Dashboard",
    desc: "Validate placements, generate official PDFs, access global placement analytics.",
    icon: TrendingUp,
  },
]

/* ── Individual Feature Card ── */
function FeatureCard({
  num,
  title,
  desc,
  icon: Icon,
  index,
}: {
  num: string
  title: string
  desc: string
  icon: LucideIcon
  index: number
}) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.4 + index * 0.12 }}
    >
      <Card variant="editorial">
        <CardHeader>
          <span className="font-serif text-4xl font-normal text-primary ed-card-num transition-colors duration-400 group-hover/card:text-secondary-foreground dark:group-hover/card:text-primary-foreground">
            {num}
          </span>
          <CardAction>
            <Icon className="h-5 w-5 opacity-30" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ── Hero Section ── */
export function HeroSection() {
  return (
    <section className="relative px-8 lg:px-16 pt-16 pb-20">
      {/* Subtle warm glow — only visible in dark mode */}
      <div
        className="ed-hero-glow absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl grid lg:grid-cols-12 gap-12 items-start">
        {/* ── Left column — 7 cols ── */}
        <div className="lg:col-span-7">
          {/* Issue marker */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex items-center gap-3 mb-8"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              Vol. I — 2025
            </span>
            <Separator className="flex-1 bg-border/50 ed-smooth" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.12 }}
            className="font-serif text-heading ed-smooth"
            style={{
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            The Future{" "}
            <span className="relative inline-block ed-underline text-primary">
              of Internship
            </span>{" "}
            Discovery
          </motion.h1>

          {/* Description columns */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
            className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-8 ed-smooth"
          >
            <p className="text-sm leading-relaxed font-light text-muted-foreground ed-smooth">
              A centralized platform bridging the gap between universities and
              enterprises. Skill-based matching, automated document generation,
              and placement tracking&mdash;all in one elegant system.
            </p>
            <p className="text-sm leading-relaxed font-light text-muted-foreground ed-smooth">
              Within the framework of MESRS strategy to strengthen the
              University-Enterprise link, Stag.io digitizes the entire
              internship lifecycle from discovery to official Convention de
              Stage.
            </p>
          </motion.div>

          {/* CTA row */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.36 }}
            className="mt-10 flex items-center gap-6"
          >
            <Button
              variant="editorial-link"
              size="editorial-sm"
              className="group"
              aria-label="Explore the platform"
            >
              Explore Platform
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
            </Button>
            <Separator
              orientation="vertical"
              className="h-5 bg-foreground/20 dark:bg-foreground/15 ed-smooth"
            />
            <span className="text-xs tracking-wide text-foreground/40 dark:text-foreground/35 ed-smooth">
              Free for Students
            </span>
          </motion.div>
        </div>

        {/* ── Right column — 5 cols, staggered editorial cards ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {FEATURES.map((item, i) => (
            <FeatureCard key={i} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
