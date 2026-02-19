import { Suspense } from "react"
import { AdminDashboard } from "@/app/[locale]/(authenticated)/_components/AdminDashboard"
import { DeptHeadDashboard } from "@/app/[locale]/(authenticated)/_components/DeptHeadDashboard"
import { RecruiterDashboard } from "@/app/[locale]/(authenticated)/_components/RecruiterDashboard"
import { StudentDashboard } from "@/app/[locale]/(authenticated)/_components/StudentDashboard"
import { DashboardContent } from "@/app/[locale]/(authenticated)/dashboard/_components/DashboardContent"
import { Skeleton } from "@/components/ui/skeleton"

// ============================================================================
// FALLBACK UI COMPONENTS
// ============================================================================

function StatsFallback() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-28 rounded-2xl" />
    </div>
  )
}

function ApplicationsFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 rounded" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

function OffersFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48 rounded" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )
}

function SidebarFallback() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

function DashboardFallback() {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="space-y-3">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-12 w-64 rounded" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>
      <div className="space-y-8">
        <StatsFallback />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <ApplicationsFallback />
            <OffersFallback />
          </div>
          <div className="lg:col-span-4">
            <SidebarFallback />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE
// Uses Suspense to support Next.js 16 cacheComponents
// ============================================================================

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent
        studentFallback={
          <div className="space-y-8">
            <StatsFallback />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="space-y-6 lg:col-span-8">
                <ApplicationsFallback />
                <OffersFallback />
              </div>
              <div className="lg:col-span-4">
                <SidebarFallback />
              </div>
            </div>
          </div>
        }
        studentComponent={StudentDashboard}
        recruiterComponent={RecruiterDashboard}
        adminComponent={AdminDashboard}
        deptHeadComponent={DeptHeadDashboard}
      />
    </Suspense>
  )
}
