"use client"

import { Github, Globe, Link as LinkIcon } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { ease } from "@/lib/animations"

interface SocialLinksProps {
  profile?: StudentProfile | null
  labels: {
    links: string
    github: string
    portfolio: string
  }
}

export function SocialLinks({ profile, labels }: SocialLinksProps) {
  const links = [
    {
      label: labels.github,
      value: profile?.githubUrl,
      icon: Github,
      href: profile?.githubUrl,
    },
    {
      label: labels.portfolio,
      value: profile?.portfolioUrl,
      icon: Globe,
      href: profile?.portfolioUrl,
    },
  ].filter((l) => !!l.value)

  if (links.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.55, duration: 0.6, ease }}
      className="border border-border/50 bg-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/20 bg-muted/30 flex items-center gap-2.5">
        <LinkIcon className="h-4 w-4 text-primary" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
          {labels.links}
        </h2>
      </div>

      <div className="divide-y divide-border/10">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors group"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted border border-border/20 group-hover:bg-background transition-colors">
              <link.icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
                {link.label}
              </p>
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {link.value?.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </a>
        ))}
      </div>
    </motion.section>
  )
}
