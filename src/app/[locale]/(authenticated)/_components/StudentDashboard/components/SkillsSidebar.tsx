"use client"

import { ExternalLink, Wrench } from "lucide-react"
import { Route } from "next"
import type { SkillTag } from "@/app/[locale]/(authenticated)/_components/StudentDashboard/types"
import { Badge } from "@/components/ui/badge"
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
    <section>
      {/* Editorial section header */}
      <div className="pb-4 border-b-2 border-foreground dark:border-foreground/15 mb-6">
        <h2 className="font-serif text-xl font-bold text-heading">
          {labels.title}
        </h2>
      </div>

      {hasSkills ? (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.id}
                variant="secondary"
                className="bg-primary/5 text-primary text-[9px] uppercase font-bold tracking-wider rounded-none px-3 py-1.5 border border-primary/10"
              >
                {skill.name}
              </Badge>
            ))}
          </div>
          <Link href={`/profile/${profileUserId}` as Route}>
            <Button
              variant="editorial-outline"
              size="editorial-sm"
              className="w-full mt-2"
            >
              {labels.manageSkills}
              <ExternalLink className="h-3 w-3 ms-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="text-center py-10 space-y-3 border border-border/30">
          <div className="inline-flex items-center justify-center p-3 bg-primary/5">
            <Wrench className="h-5 w-5 text-muted-foreground/30" />
          </div>
          <p className="text-[10px] text-muted-foreground/50 font-medium max-w-[200px] mx-auto leading-relaxed">
            {labels.emptyMessage}
          </p>
          <Link href={`/profile/${profileUserId}` as Route}>
            <Button
              variant="editorial"
              size="editorial-sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mt-2"
            >
              {labels.addSkills}
            </Button>
          </Link>
        </div>
      )}
    </section>
  )
}
