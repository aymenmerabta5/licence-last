"use client"

import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"

import { reveal, revealWithDelay } from "@/lib/animations"
import { Button } from "@/components/ui/button"

interface SubmitButtonProps {
  isSubmitting: boolean
  children: React.ReactNode
  className?: string
  delay?: number
}

export function SubmitButton({
  isSubmitting,
  children,
  className,
  delay = 0,
}: SubmitButtonProps) {
  return (
    <motion.div {...reveal} transition={revealWithDelay(delay)}>
      <Button
        type="submit"
        variant="editorial"
        size="editorial"
        className={`w-full h-12 ${className ?? ""}`}
        disabled={isSubmitting}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </Button>
    </motion.div>
  )
}
