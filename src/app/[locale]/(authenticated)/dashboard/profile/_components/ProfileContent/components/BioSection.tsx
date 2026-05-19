"use client"

import { Edit3, Quote } from "lucide-react"
import * as motion from "motion/react-client"
import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease, fadeIn, reveal } from "@/lib/animations"

interface BioSectionProps {
  profile?: StudentProfile | null
  canEdit: boolean
  labels: {
    bio: string
    emptyMessage: string
    writeBio: string
  }
}

export function BioSection({ profile, canEdit, labels }: BioSectionProps) {
  const hasBio = !!profile?.bio

  return (
    <motion.section
      {...reveal}
      transition={{ delay: 0.3, duration: 0.6, ease }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-0.5 w-8 bg-primary" />
        <h2 className="font-serif text-xl sm:text-2xl text-heading">
          {labels.bio}
        </h2>
      </div>

      {hasBio ? (
        <div className="border border-border/50 bg-card p-8 sm:p-10 relative">
          <Quote className="h-8 w-8 text-primary/10 mb-4" />
          <motion.p
            {...fadeIn}
            transition={{ duration: 0.8 }}
            className="text-base sm:text-lg text-foreground leading-relaxed whitespace-pre-line"
          >
            {profile.bio}
          </motion.p>
        </div>
      ) : (
        <div className="border border-dashed border-border/40 bg-card/50 p-10 sm:p-14 text-center space-y-6">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-lg bg-muted border border-border/20">
            <Edit3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {labels.emptyMessage}
          </p>
          {canEdit && (
            <Link href="/dashboard/settings">
              <Button
                size="sm"
                className="rounded-md text-xs font-bold uppercase tracking-[0.15em]"
              >
                <Edit3 className="h-3.5 w-3.5 me-2" />
                {labels.writeBio}
              </Button>
            </Link>
          )}
        </div>
      )}
    </motion.section>
  )
}
