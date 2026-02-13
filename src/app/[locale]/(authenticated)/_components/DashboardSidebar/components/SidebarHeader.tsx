"use client"

import * as motion from "motion/react-client"

export function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 py-8 h-20">
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif text-2xl tracking-tight text-heading"
        >
          Internex<span className="text-primary">.</span>io
        </motion.span>
      )}
      {isCollapsed && (
        <span className="font-serif text-2xl font-bold text-primary mx-auto">I.</span>
      )}
    </div>
  )
}
