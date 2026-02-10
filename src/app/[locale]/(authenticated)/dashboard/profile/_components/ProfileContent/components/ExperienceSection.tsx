"use client"

import * as motion from "motion/react-client"
import { Briefcase, ShieldCheck } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface ExperienceSectionProps {
  labels: {
    experience: string
    emptyMessage: string
    addExperience: string
  }
  canEdit: boolean
}

export function ExperienceSection({ labels, canEdit }: ExperienceSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-heading">{labels.experience}</h2>
        <ShieldCheck className="h-5 w-5 text-green-500/50" />
      </div>
      <Card className="p-8 border-border/40 bg-background rounded-2xl shadow-sm text-center">
        <div className="space-y-3 max-w-xs mx-auto">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary/10">
            <Briefcase className="h-6 w-6 text-muted-foreground/30" />
          </div>
          <p className="text-xs text-muted-foreground/60 font-medium leading-relaxed">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings">
              <Button
                variant="editorial-outline"
                size="editorial-sm"
                className="rounded-xl border-border/40 hover:border-primary mt-2"
              >
                {labels.addExperience}
              </Button>
            </Link>
          )}
        </div>
      </Card>
    </motion.section>
  )
}
