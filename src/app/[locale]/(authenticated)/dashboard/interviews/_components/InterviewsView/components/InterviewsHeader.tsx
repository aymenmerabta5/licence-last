import { CalendarDays } from "lucide-react"
import type { InterviewsRole } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { Badge } from "@/components/ui/badge"

interface InterviewsHeaderProps {
  role: InterviewsRole
}

const ROLE_LABELS: Record<InterviewsRole, string> = {
  student: "Student",
  company_admin: "Company",
}

export function InterviewsHeader({ role }: InterviewsHeaderProps) {
  return (
    <header className="space-y-3">
      <div className="h-0.5 bg-primary" />
      <div className="border border-border/50 p-6 sm:p-8 space-y-4">
        <Badge variant="editorial-muted">{ROLE_LABELS[role]} dashboard</Badge>
        <div className="space-y-2">
          <h1 className="font-serif text-[clamp(1.8rem,3.2vw,2.4rem)] leading-[1.1] tracking-tight text-heading">
            Interviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage scheduling and confirmations for interview slots.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>All times are shown in your local timezone.</span>
        </div>
      </div>
    </header>
  )
}
