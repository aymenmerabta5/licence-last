"use client"

import * as motion from "motion/react-client"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-muted/30 border-s-2 border-primary/20">
      <div className="flex gap-1">
        <motion.span
          key="dot-1"
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          key="dot-2"
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          key="dot-3"
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}
