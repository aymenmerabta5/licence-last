"use client"

import { AnimatePresence } from "motion/react"
import * as motion from "motion/react-client"
import { useRouter } from "@/i18n/routing"

import { ease } from "@/lib/animations"

export function SidebarHeader({ isCollapsed }: { isCollapsed: boolean }) {
  const router = useRouter()
  return (
    <div className="px-6 h-24 flex items-center justify-between border-b border-border overflow-hidden">
      <AnimatePresence initial={false}>
        {isCollapsed ? (
          <motion.span
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease }}
            className="font-serif text-2xl font-bold text-heading mx-auto tracking-tighter"
          >
            S<span className="text-primary">.</span>
          </motion.span>
        ) : (
          <motion.span
            key="expanded"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease }}
            className="font-serif text-[28px] tracking-tighter text-heading hover:cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            Stag<span className="text-primary">.</span>io
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
