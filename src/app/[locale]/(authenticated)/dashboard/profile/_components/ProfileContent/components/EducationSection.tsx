"use client"

import * as motion from "motion/react-client"
import { BookOpen, MapPin } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { StudentProfile, StudentUniversity } from "../types"

interface EducationSectionProps {
  profile?: StudentProfile | null
  university?: StudentUniversity | null
  canEdit: boolean
  labels: {
    education: string
    emptyMessage: string
    addEducation: string
  }
}

export function EducationSection({ profile, university, canEdit, labels }: EducationSectionProps) {
  const hasEducation = !!university

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <h2 className="font-serif text-2xl font-bold text-heading">{labels.education}</h2>
      <Card className="p-6 border-transparent bg-secondary/[0.03] hover:bg-secondary/[0.06] rounded-2xl flex items-start gap-5 group transition-all">
        <div className="h-12 w-12 rounded-xl bg-white dark:bg-card border border-border/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          {hasEducation ? (
            <div className="space-y-1">
              <p className="text-base font-bold text-heading">
                {university.name}
                {university.abbreviation && (
                  <span className="text-muted-foreground font-normal ms-2">
                    ({university.abbreviation})
                  </span>
                )}
              </p>
              {(profile?.department || profile?.level) && (
                <p className="text-sm text-muted-foreground">
                  {[profile.department, profile.level].filter(Boolean).join(" — ")}
                </p>
              )}
              {university.city && (
                <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {university.city}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground italic">
                {labels.emptyMessage}
              </p>
              {canEdit && (
                <Link href="/dashboard/settings">
                  <Button
                    variant="editorial-outline"
                    size="editorial-sm"
                    className="rounded-xl border-border/40 hover:border-primary"
                  >
                    {labels.addEducation}
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </Card>
    </motion.section>
  )
}
