import { LinkIcon, Loader2, MapPin, UserRound } from "lucide-react"
import { InterviewStatusBadge } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewStatusBadge"
import type { CompanyInterviewView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/types"
import { formatInterviewSlot } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CompanyInterviewsSectionProps {
  interviews: CompanyInterviewView[]
  isLoading: boolean
  errorMessage: string | null
}

export function CompanyInterviewsSection({
  interviews,
  isLoading,
  errorMessage,
}: CompanyInterviewsSectionProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (errorMessage) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Could not load interviews</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (interviews.length === 0) {
    return (
      <Card className="border-dashed border-border/60">
        <CardHeader>
          <CardTitle>No interviews proposed</CardTitle>
          <CardDescription>
            Use the form to create your first interview proposal.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <section className="space-y-4">
      {interviews.map((interview) => (
        <Card
          key={interview.id}
          variant="editorial"
          className="cursor-default hover:bg-transparent"
        >
          <CardHeader>
            <div className="space-y-1">
              <CardTitle className="font-serif text-xl">
                {interview.offerTitle}
              </CardTitle>
              <CardDescription className="inline-flex items-center gap-2">
                <UserRound className="h-3.5 w-3.5" />
                {interview.studentName ?? "Unnamed student"}
              </CardDescription>
            </div>
            <InterviewStatusBadge status={interview.status} />
          </CardHeader>

          <CardContent className="space-y-4">
            {interview.note && (
              <p className="text-sm text-muted-foreground">{interview.note}</p>
            )}

            <div className="space-y-3">
              {interview.slots.map((slot) => {
                const isConfirmedSlot = interview.confirmedSlotId === slot.id
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      "border border-border/50 p-3 space-y-2",
                      isConfirmedSlot && "border-primary bg-primary/5",
                    )}
                  >
                    <p className="text-sm font-medium">
                      {formatInterviewSlot(slot)}
                    </p>

                    {slot.location && (
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {slot.location}
                      </p>
                    )}

                    {slot.meetingUrl && (
                      <a
                        href={slot.meetingUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs text-primary inline-flex items-center gap-2 hover:underline"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                        Meeting URL
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
