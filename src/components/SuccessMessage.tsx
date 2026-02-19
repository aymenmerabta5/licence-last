"use client"

import { CheckCircle2 } from "lucide-react"
import * as motion from "motion/react-client"

interface SuccessMessageProps {
  message: string
  className?: string
}

export function SuccessMessage({ message, className }: SuccessMessageProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className={`flex items-start gap-2.5 p-3.5 text-sm text-green-700 bg-green-50 border border-green-200 dark:text-green-400 dark:bg-green-950/20 dark:border-green-800 ${className ?? ""}`}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  )
}
