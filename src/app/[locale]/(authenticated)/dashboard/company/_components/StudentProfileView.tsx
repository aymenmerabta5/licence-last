"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

interface StudentProfileViewProps {
  studentUserId: string
  label: string
}

export function StudentProfileView({
  studentUserId,
  label,
}: StudentProfileViewProps) {
  return (
    <Link
      href={`/profile/${studentUserId}` as "/profile"}
      className="inline-flex"
    >
      <Button variant="outline" size="sm" className="gap-1.5 text-xs">
        <ExternalLink className="h-3.5 w-3.5" />
        {label}
      </Button>
    </Link>
  )
}
