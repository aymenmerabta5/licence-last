"use client"

import * as motion from "motion/react-client"

export function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div className="px-6 py-8 flex items-center justify-between">
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-serif text-[28px] tracking-tighter text-heading"
        >
          Internex<span className="text-primary opacity-80">.</span>
        </motion.span>
      )}
      {isCollapsed && (
        <span className="font-serif text-2xl font-bold text-heading mx-auto tracking-tighter">
          In.
        </span>
      )}
    </div>
  )
}
