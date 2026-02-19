import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"
import { WorkflowStep } from "@/app/[locale]/_components/HowItWorksSection/components/WorkflowStep"
import type { WorkflowStepData } from "@/app/[locale]/_components/HowItWorksSection/types"
import { ease, reveal } from "@/lib/animations"

interface UserTypeColumnProps {
  id?: string
  icon: LucideIcon
  title: string
  subtitle: string
  steps: WorkflowStepData[]
  columnIndex: number
  accentClass: string
}

export function UserTypeColumn({
  id,
  icon: Icon,
  title,
  subtitle,
  steps,
  columnIndex,
  accentClass,
}: UserTypeColumnProps) {
  return (
    <motion.div
      id={id}
      {...reveal}
      transition={{ duration: 0.7, ease, delay: 0.2 + columnIndex * 0.15 }}
      className="relative flex flex-col"
    >
      <div className="mb-8 border-b-2 border-foreground dark:border-foreground/15 pb-6 transition-colors duration-500">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${accentClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-foreground/40 [[dir=rtl]_&]:tracking-normal">
            {subtitle}
          </span>
        </div>
        <h3 className="font-serif text-2xl text-heading transition-colors duration-500">
          {title}
        </h3>
      </div>

      <div className="flex flex-col">
        {steps.map((step, index) => (
          <WorkflowStep
            key={`${step.stepNumber}-${index}`}
            index={index + columnIndex * 4}
            {...step}
          />
        ))}
      </div>
    </motion.div>
  )
}
