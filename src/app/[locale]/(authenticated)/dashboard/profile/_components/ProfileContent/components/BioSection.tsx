"use client"

import * as motion from "motion/react-client"
import { Edit3 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { StudentProfile } from "../types"

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
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-heading">
          {labels.bio}
        </h2>
      </div>
      <Card className="p-6 border-border/40 bg-background rounded-2xl shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 end-0 w-32 h-32 bg-primary/[0.02] blur-[60px] rounded-full group-hover:bg-primary/[0.05] transition-colors duration-500" />
        <div className="relative">
          {hasBio ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                {labels.emptyMessage}
              </p>
              {canEdit && (
                <Link href="/dashboard/settings" className="inline-block mt-4">
                  <Button
                    variant="editorial-outline"
                    size="editorial-sm"
                    className="rounded-xl border-border/40 hover:border-primary"
                  >
                    <Edit3 className="h-3.5 w-3.5 me-2" /> {labels.writeBio}
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
