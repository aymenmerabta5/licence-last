"use client"

import * as motion from "motion/react-client"
import { Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

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
      transition={{ delay: 0.4, duration: 0.6, ease }}
    >
      {/* Section header with accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-0.5 bg-primary" />
        <h2 className="font-serif text-2xl font-bold text-heading tracking-tight">
          {labels.experience}
        </h2>
      </div>

      <div className="border border-dashed border-border/30 p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-24 h-24 bg-primary/[0.02] blur-[50px] rounded-full" />
        <div className="relative text-center space-y-3 max-w-sm mx-auto">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
            <Briefcase className="h-5 w-5 text-primary/30" />
          </div>
          <p className="text-sm text-muted-foreground/50 font-light leading-relaxed">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings" className="inline-block mt-2">
              <Button
                variant="editorial-outline"
                size="sm"
                className="border-border/40 hover:border-primary h-9 px-5"
              >
                {labels.addExperience}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.section>
  )
}
