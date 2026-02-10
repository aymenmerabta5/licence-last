"use client"

import * as motion from "motion/react-client"
import { Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { ProfileUser } from "../types"
import { ROLE_LABELS, getInitials, formatMemberSince } from "../utils"

interface ProfileHeaderProps {
  user: ProfileUser
  editButtonLabel: string
  canEdit: boolean
}

export function ProfileHeader({ user, editButtonLabel, canEdit }: ProfileHeaderProps) {
  const initials = getInitials(user.name)
  const memberSince = formatMemberSince(user.createdAt)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="h-44 sm:h-56 w-full rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.06]" />
        <div className="absolute top-8 end-8 w-56 h-56 bg-primary/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 start-16 w-40 h-40 bg-secondary/10 blur-[80px] rounded-full" />

        <div className="absolute top-5 start-6">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
            Profile Edition
          </span>
        </div>
      </div>

      <div className="px-6 sm:px-8 -mt-14 sm:-mt-18 relative z-10 flex flex-col sm:flex-row sm:items-end gap-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
          className="h-28 w-28 sm:h-36 sm:w-36 rounded-full border-[6px] border-background bg-primary flex items-center justify-center text-white text-4xl sm:text-5xl font-serif shadow-2xl shadow-primary/20 shrink-0"
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || "Profile"}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </motion.div>

        <div className="flex-1 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-heading tracking-tight leading-none">
                {user.name || "Anonymous User"}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-primary/10 text-primary border-none text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                  {ROLE_LABELS[user.role || "student"] || user.role}
                </Badge>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSince}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-3"
            >
              {canEdit && (
                <Link href="/dashboard/settings">
                  <Button
                    variant="editorial"
                    className="rounded-xl h-10 px-5 shadow-lg shadow-primary/15 border-primary bg-primary text-white hover:bg-primary/90"
                  >
                    {editButtonLabel}
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
