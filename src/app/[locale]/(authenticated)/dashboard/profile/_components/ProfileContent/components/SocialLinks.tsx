"use client"

import * as motion from "motion/react-client"
import { Github, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { StudentProfile } from "../types"

interface SocialLinksProps {
  profile?: StudentProfile | null
  labels: {
    links: string
  }
}

export function SocialLinks({ profile, labels }: SocialLinksProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-3"
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
        {labels.links}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <SocialLink
          href={profile?.githubUrl}
          icon={Github}
          label="GitHub"
        />
        <SocialLink
          href={profile?.portfolioUrl}
          icon={Globe}
          label="Portfolio"
        />
      </div>
    </motion.section>
  )
}

interface SocialLinkProps {
  href?: string | null
  icon: typeof Github
  label: string
}

function SocialLink({ href, icon: Icon, label }: SocialLinkProps) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="contents"
      >
        <Button
          variant="editorial-outline"
          className="justify-start gap-3 rounded-xl border-border/40 hover:border-heading dark:hover:border-white h-11"
        >
          <Icon className="h-4 w-4" /> {label}
        </Button>
      </a>
    )
  }

  return (
    <Button
      variant="editorial-outline"
      className="justify-start gap-3 rounded-xl border-border/40 text-muted-foreground/50 h-11"
      disabled
    >
      <Icon className="h-4 w-4" /> {label}
    </Button>
  )
}
