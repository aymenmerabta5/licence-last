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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease }}
      className="relative"
    >
      <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-8 py-7 border-b border-slate-50 bg-slate-50/30 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5">
            <LinkIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
            {labels.links}
          </h2>
        </div>

        <div className="p-8 space-y-4">
          {links.map((link, i) => (
            <motion.a
              key={i}
              href={link.href!}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 5 }}
              className="flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 transition-all group/link"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 group-hover/link:border-primary/20 group-hover/link:bg-white transition-all duration-300">
                <link.icon className="h-6 w-6 text-slate-400 group-hover/link:text-primary transition-colors" />
              </div>
              <div className="space-y-1 overflow-hidden">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {link.label}
                </p>
                <p className="text-[15px] font-bold text-slate-700 truncate group-hover/link:text-primary transition-colors">
                  {link.value?.replace(/^https?:\/\//, "")}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
