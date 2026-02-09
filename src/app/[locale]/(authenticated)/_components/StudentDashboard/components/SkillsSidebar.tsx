"use client"

import { Wrench, ExternalLink } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { SkillTag } from "../types"

interface SkillsSidebarProps {
  skills: SkillTag[]
  labels: {
    title: string
    manageSkills: string
    emptyMessage: string
    addSkills: string
  }
}

export function SkillsSidebar({ skills, labels }: SkillsSidebarProps) {
  const hasSkills = skills.length > 0

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-xl font-bold text-heading">
        {labels.title}
      </h2>
      <Card className="bg-background border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-6">
          {hasSkills ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="secondary"
                    className="bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-wider rounded-full px-3 py-1 border-none"
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
              <Link href="/dashboard/profile">
                <Button
                  variant="editorial-outline"
                  size="editorial-sm"
                  className="w-full mt-4 text-[9px] h-10 border-border/60 hover:border-primary"
                >
                  {labels.manageSkills}{" "}
                  <ExternalLink className="h-3.5 w-3.5 ms-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-secondary/10">
                <Wrench className="h-5 w-5 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground/60 font-medium max-w-[200px] mx-auto leading-relaxed">
                {labels.emptyMessage}
              </p>
              <Link href="/dashboard/profile">
                <Button
                  variant="editorial-outline"
                  size="editorial-sm"
                  className="border-border/40 hover:border-primary mt-2"
                >
                  {labels.addSkills}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
