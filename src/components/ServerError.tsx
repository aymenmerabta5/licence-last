"use client"

import { AlertCircle } from "lucide-react"
import * as motion from "motion/react-client"

interface ServerErrorProps {
  message: string
}

export function ServerError({ message }: ServerErrorProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="flex items-start gap-2.5 p-3.5 text-sm text-destructive bg-destructive/5 border border-destructive/15"
    >
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  )
}
