"use client"

import { ExternalLink, TerminalSquare } from "lucide-react"
import { Route } from "next"
import type { SkillTag } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface SkillsSidebarProps {
  skills: SkillTag[]
  profileUserId: string
  labels: {
    title: string
    manageSkills: string
    emptyMessage: string
    addSkills: string
  }
}

export function SkillsSidebar({
  skills,
  profileUserId,
  labels,
}: SkillsSidebarProps) {
  const hasSkills = skills.length > 0

  return (
    <section className="h-full group flex flex-col pt-8 lg:pt-0">
      {/* Editorial section header */}
      <div className="flex items-end justify-between pb-6 mb-8 border-b-4 border-foreground">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-2 block">
            Core Competencies
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal tracking-tighter text-foreground">
            {labels.title}
          </h2>
        </div>
      </div>

      <div className="flex-grow border-2 border-foreground bg-foreground p-6 relative overflow-hidden transition-colors duration-500 hover:bg-background group/box">
        {/* Decorative Grid Lines inside */}
        <div className="absolute inset-0 bg-[linear-gradient(oklch(var(--border)_/_0.2)_1px,transparent_1px),linear-gradient(90deg,oklch(var(--border)_/_0.2)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 group-hover/box:opacity-100 transition-opacity" />

        <div className="relative z-10 h-full flex flex-col">
          {hasSkills ? (
            <>
              <div className="flex flex-wrap gap-2 mb-8">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="bg-background text-foreground group-hover/box:bg-foreground group-hover/box:text-background text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1.5 transition-colors duration-500"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="mt-auto">
                <Link
                  href={`/profile/${profileUserId}` as Route}
                  className="block w-full"
                >
                  <Button className="w-full bg-primary text-primary-foreground group-hover/box:bg-foreground group-hover/box:text-background border-none rounded-none font-bold uppercase tracking-[0.15em] text-[10px] h-12 transition-all duration-300 shadow-[4px_4px_0_0_oklch(var(--background))] group-hover/box:shadow-[4px_4px_0_0_oklch(var(--primary))]">
                    {labels.manageSkills}
                    <ExternalLink className="h-3.5 w-3.5 ms-2" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 space-y-4 flex flex-col items-center justify-center h-full">
              <div className="h-16 w-16 border-2 border-background flex items-center justify-center text-background group-hover/box:border-foreground group-hover/box:text-foreground transition-colors duration-500 rotate-12 group-hover/box:-rotate-6">
                <TerminalSquare className="h-6 w-6" />
              </div>
              <p className="text-xs text-background/80 group-hover/box:text-foreground/80 font-medium max-w-[200px] mx-auto leading-relaxed uppercase tracking-[0.1em] transition-colors duration-500">
                {labels.emptyMessage}
              </p>
              <Link
                href={`/profile/${profileUserId}` as Route}
                className="w-full mt-8"
              >
                <Button className="w-full bg-background border-2 border-background text-foreground hover:bg-primary hover:border-primary hover:text-primary-foreground group-hover/box:bg-foreground group-hover/box:border-foreground group-hover/box:text-background rounded-none font-bold uppercase tracking-[0.15em] text-[10px] h-12 transition-all duration-300">
                  {labels.addSkills}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Heavy bottom border like an end mark */}
      <div className="mt-6 h-2 w-full bg-foreground" />
    </section>
  )
}
