"use client"

import * as motion from "motion/react-client"

import { reveal, revealWithDelay } from "@/lib/animations"

interface FormSectionProps {
  title: string
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FormSection({
  title,
  children,
  delay = 0,
  className,
}: FormSectionProps) {
  return (
    <motion.div
      {...reveal}
      transition={revealWithDelay(delay)}
      className={`space-y-5 ${className ?? ""}`}
    >
      <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </motion.div>
  )
}
