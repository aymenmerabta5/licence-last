"use client"

import * as motion from "motion/react-client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface WelcomeHeroProps {
  userName: string | null
  profileCompleteness: number
}

export function WelcomeHero({ userName, profileCompleteness }: WelcomeHeroProps) {
  const firstName = userName?.split(" ")[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_380px_at_20%_0%,theme(colors.primary/12),transparent_60%),radial-gradient(700px_320px_at_92%_10%,theme(colors.primary/10),transparent_55%),linear-gradient(to_bottom,transparent,theme(colors.primary/6))]" />
      <div className="relative z-10 max-w-2xl space-y-4">
        <Badge
          variant="editorial"
          className="h-6 px-3 text-[10px] tracking-[0.22em]"
        >
          Profile Strength: {profileCompleteness}%
        </Badge>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight text-heading">
          Ready to secure your{" "}
          <span className="text-primary italic">dream internship</span>,{" "}
          {firstName}?
        </h2>
        <p className="text-muted-foreground text-sm font-light leading-relaxed">
          {profileCompleteness < 100
            ? "Complete your profile to stand out to recruiters and unlock more opportunities."
            : "Your profile is complete! Keep exploring opportunities and applying."}
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          {profileCompleteness < 100 && (
            <Link href="/dashboard/profile">
              <Button
                variant="editorial"
                size="editorial"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Complete Profile
              </Button>
            </Link>
          )}
          <Link href="/dashboard/explore">
            <Button
              variant="editorial-outline"
              size="editorial"
              className="hover:bg-primary/10"
            >
              Explore Internships
            </Button>
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute top-0 end-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 start-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
    </motion.div>
  )
}
