import type { RefObject } from "react"
import * as motion from "motion/react-client"
import { Loader2 } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

import { ValidationCard } from "@/app/[locale]/(authenticated)/dashboard/admin/validations/_components/AdminValidationsView/components/ValidationCard"

interface Application {
  id: string
  companyActionAt: Date | string | null
  student: { name: string | null }
  company: { name: string }
  university: { name: string; abbreviation: string | null } | null
  profile: { level: string | null } | null
  offer: { title: string; internshipType: string }
  skills: { id: string; name: string }[]
}

interface ValidationsListProps {
  applications: Application[]
  isFetchingNextPage: boolean
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function ValidationsList({
  applications,
  isFetchingNextPage,
  sentinelRef,
}: ValidationsListProps) {
  return (
    <>
      <div className="space-y-3">
        {applications.map((app, i) => (
          <motion.div
            key={app.id}
            {...reveal}
            transition={{ duration: 0.4, ease, delay: 0.03 * i }}
          >
            <ValidationCard app={app} />
          </motion.div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  )
}
