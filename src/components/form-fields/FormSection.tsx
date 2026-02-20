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
      className={`space-y-6 ${className ?? ""}`}
    >
      <div className="flex items-center gap-4 border-b border-border/80 pb-4">
        <h2 className="font-serif text-lg tracking-wide text-heading">
          {title}
        </h2>
      </div>
      <div className="space-y-6 pt-2">{children}</div>
    </motion.div>
  )
}
