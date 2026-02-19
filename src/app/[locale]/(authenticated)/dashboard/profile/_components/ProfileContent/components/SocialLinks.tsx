"use client"

import { ExternalLink, Github, Globe } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { ease } from "@/lib/animations"
import { cn } from "@/lib/utils"

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
      key: "github",
      href: profile?.githubUrl,
      icon: Github,
      label: labels.github,
    },
    {
      key: "portfolio",
      href: profile?.portfolioUrl,
      icon: Globe,
      label: labels.portfolio,
    },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6, ease }}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-px flex-1 bg-border/30" />
        <h2 className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 shrink-0 [[dir=rtl]_&]:tracking-normal">
          {labels.links}
        </h2>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      <div className="space-y-2">
        {links.map((link, i) => {
          const Icon = link.icon
          const isActive = !!link.href

          if (isActive) {
            return (
              <motion.a
                key={link.key}
                href={link.href!}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 + i * 0.06, duration: 0.4, ease }}
                className="flex items-center gap-3 px-5 py-3.5 border border-border/40 group transition-all duration-200 hover:border-primary/40 hover:bg-primary/[0.02]"
              >
                <Icon className="h-4 w-4 text-heading group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold text-heading flex-1 group-hover:text-primary transition-colors">
                  {link.label}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
              </motion.a>
            )
          }

          return (
            <motion.div
              key={link.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.06, duration: 0.4, ease }}
              className={cn(
                "flex items-center gap-3 px-5 py-3.5 border border-dashed border-border/25",
              )}
            >
              <Icon className="h-4 w-4 text-muted-foreground/20" />
              <span className="text-sm font-medium text-muted-foreground/30 flex-1">
                {link.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
