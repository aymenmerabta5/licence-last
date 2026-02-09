"use client"

import * as motion from "motion/react-client"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

interface FormSectionProps {
  title: string
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FormSection({ title, children, delay = 0, className }: FormSectionProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay }}
      className={`space-y-5 ${className ?? ""}`}
    >
      <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </motion.div>
  )
}
