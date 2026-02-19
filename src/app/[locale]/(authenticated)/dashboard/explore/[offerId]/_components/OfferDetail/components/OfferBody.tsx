"use client"

import { FileText, Wrench } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { OfferDetailProps } from "@/app/[locale]/(authenticated)/dashboard/explore/[offerId]/_components/OfferDetail/types"
import { ease, reveal } from "@/lib/animations"

interface OfferBodyProps {
  offer: OfferDetailProps["offer"]
}

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border/30" />
      <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/30" />
    </div>
  )
}

export function OfferBody({ offer }: OfferBodyProps) {
  const t = useTranslations("dashboard.offerDetail")

  return (
    <div className="space-y-8">
      {/* Description */}
      <motion.section
        {...reveal}
        transition={{ duration: 0.5, ease, delay: 0.1 }}
        className="space-y-4"
      >
        <SectionDivider icon={FileText} label={t("description")} />
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {offer.description}
        </div>
      </motion.section>

      {/* Skills */}
      {offer.skills.length > 0 && (
        <motion.section
          {...reveal}
          transition={{ duration: 0.5, ease, delay: 0.15 }}
          className="space-y-4"
        >
          <SectionDivider icon={Wrench} label={t("requiredSkills")} />
          <div className="flex flex-wrap gap-2">
            {offer.skills.map((skill, i) => (
              <motion.span
                key={skill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease, delay: 0.2 + i * 0.04 }}
                className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-primary/5 border border-primary/15 text-primary"
              >
                {skill.name}
              </motion.span>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
