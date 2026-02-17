import type { LucideIcon } from "lucide-react"

export interface WorkflowStepData {
  icon: LucideIcon
  title: string
  description: string
  stepNumber: string
}

export interface UserTypeData {
  id?: string
  icon: LucideIcon
  title: string
  subtitle: string
  accentClass: string
  steps: WorkflowStepData[]
}

