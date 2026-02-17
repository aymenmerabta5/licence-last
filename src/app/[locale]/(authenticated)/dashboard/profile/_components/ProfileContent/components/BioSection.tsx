"use client"

import * as motion from "motion/react-client"
import { Edit3, Quote } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"

import type { StudentProfile } from "@/app/[locale]/(authenticated)/dashboard/profile/_components/ProfileContent/types"

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6, ease }}
    >
      {/* Section header with accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-5 w-0.5 bg-primary" />
        <h2 className="font-serif text-2xl font-bold text-heading tracking-tight">
          {labels.bio}
        </h2>
      </div>

      {hasBio ? (
        <div className="relative border-s-2 border-primary/15 ps-6 sm:ps-8">
          {/* Quote mark decoration */}
          <Quote className="absolute top-0 start-6 sm:start-8 h-6 w-6 text-primary/[0.06] -translate-y-1" />

          <div className="relative">
            {/* Drop cap effect via first-letter */}
            <p className="text-base text-foreground/85 leading-[1.8] whitespace-pre-line first-letter:float-start first-letter:font-serif first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:leading-[0.8] first-letter:me-3 first-letter:mt-1">
              {profile.bio}
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-border/30 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-primary/[0.02] blur-[60px] rounded-full" />
          <div className="relative text-center space-y-3 max-w-sm mx-auto">
            <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/5">
              <Edit3 className="h-5 w-5 text-primary/30" />
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
                  <Edit3 className="h-3.5 w-3.5 me-2" /> {labels.writeBio}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </motion.section>
  )
}
