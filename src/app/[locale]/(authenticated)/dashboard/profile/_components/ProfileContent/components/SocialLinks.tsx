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
      bgColor: "bg-slate-900",
      hoverBg: "group-hover/link:bg-slate-800",
      textColor: "text-white",
    },
    {
      label: labels.portfolio,
      value: profile?.portfolioUrl,
      icon: Globe,
      href: profile?.portfolioUrl,
      bgColor: "bg-primary",
      hoverBg: "group-hover/link:bg-primary/90",
      textColor: "text-white",
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
      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/5">
            <LinkIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800">
            {labels.links}
          </h2>
        </div>

        <div className="p-6 space-y-3">
          {links.map((link, i) => (
            <motion.a
              key={i}
              href={link.href!}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all group/link hover:bg-white hover:border-primary/20 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${link.bgColor} ${link.hoverBg} transition-all duration-300`}
              >
                <link.icon className={`h-5 w-5 ${link.textColor}`} />
              </div>
              <div className="space-y-0.5 overflow-hidden min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                  {link.label}
                </p>
                <p className="text-[13px] font-bold text-slate-700 truncate group-hover/link:text-primary transition-colors">
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
