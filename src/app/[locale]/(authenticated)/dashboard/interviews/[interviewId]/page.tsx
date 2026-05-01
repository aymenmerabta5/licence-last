import { notFound } from "next/navigation"
import { InterviewDetailView } from "@/app/[locale]/(authenticated)/dashboard/interviews/_components/InterviewsView/components/InterviewDetailView"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { localeRedirect } from "@/lib/navigation"
import { requireRole } from "@/lib/auth-guards"
import { orpcClient } from "@/server/orpc/client"

type Params = Promise<{ interviewId: string }>

async function InterviewDetailPageContent({ interviewId }: { interviewId: string }) {
  const _user = await requireRole(["student"])

  if (!isFeatureEnabled("INTERVIEWS")) {
    return localeRedirect("/dashboard/applications")
  }

  try {
    const interview = await orpcClient.interviews.getById({ interviewId })
    return <InterviewDetailView interview={interview} />
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "NOT_FOUND"
    ) {
      notFound()
    }
    throw error
  }
}

export default async function InterviewDetailPage({ params }: { params: Params }) {
  const { interviewId } = await params
  return <InterviewDetailPageContent interviewId={interviewId} />
}
