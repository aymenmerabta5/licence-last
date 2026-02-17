import * as motion from "motion/react-client"
import type { LucideIcon } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

interface WorkflowStepProps {
  icon: LucideIcon
  title: string
  description: string
  stepNumber: string
  index: number
}

export function WorkflowStep({
  icon: Icon,
  title,
  description,
  stepNumber,
  index,
}: WorkflowStepProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease, delay: 0.3 + index * 0.1 }}
      className="group relative"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-all duration-300 group-hover:border-primary group-hover:bg-primary/5">
            <Icon className="h-5 w-5 text-primary transition-colors duration-300" />
          </div>
          <div className="mt-2 h-full w-px bg-gradient-to-b from-primary/20 to-transparent" />
        </div>

        <div className="flex-1 pb-8">
          <span className="font-serif text-xs font-bold tracking-[0.2em] uppercase text-primary/60 [[dir=rtl]_&]:tracking-normal">
            {stepNumber}
          </span>
          <h4 className="mt-1 font-serif text-lg text-heading transition-colors duration-500">
            {title}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground transition-colors duration-500">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

