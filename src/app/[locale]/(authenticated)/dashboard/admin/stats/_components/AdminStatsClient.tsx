"use client"

import { useQuery } from "@tanstack/react-query"
import { BarChart3, Building2, GraduationCap, Briefcase, PieChart } from "lucide-react"

import { orpc } from "@/server/orpc/client"
import { StatsCard } from "@/app/[locale]/(authenticated)/_components/StatsCard"
import { Card, CardContent } from "@/components/ui/card"

function formatPercent(n: number) {
  return `${Math.max(0, Math.min(100, n))}%`
}

export function AdminStatsClient() {
  const { data, isLoading } = useQuery(orpc.stats.getAdminStats.queryOptions())
  const trustIndicesQuery = useQuery(
    orpc.companies.listTrustIndices.queryOptions({ input: { limit: 12 } }),
  )
  const reportsQuery = useQuery(
    orpc.companies.listReports.queryOptions({ input: { status: "open", limit: 12 } }),
  )

  const cards = data
    ? [
        {
          title: "Total Students",
          value: String(data.totalStudents),
          description: `${data.unplacedStudents} unplaced`,
          icon: GraduationCap,
        },
        {
          title: "Placed Students",
          value: String(data.placedStudents),
          description: `Placement rate ${formatPercent(data.placementRate)}`,
          icon: PieChart,
        },
        {
          title: "Approved Companies",
          value: String(data.totalCompaniesApproved),
          description: "Active partners",
          icon: Building2,
        },
        {
          title: "Published Offers",
          value: String(data.totalOffersPublished),
          description: "Visible to students",
          icon: Briefcase,
        },
        {
          title: "Applications",
          value: String(data.totalApplications),
          description: "All statuses",
          icon: BarChart3,
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          Admin Analytics
        </p>
        <h1 className="font-serif text-[clamp(2.25rem,4vw,3rem)] leading-none tracking-tight text-heading">
          Platform Statistics
        </h1>
        <p className="text-sm text-muted-foreground font-light max-w-2xl">
          Snapshot of placements, activity, and overall health.
        </p>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading…</div>
      )}

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => (
            <StatsCard
              key={c.title}
              title={c.title}
              value={c.value}
              description={c.description}
              icon={c.icon}
              index={idx}
            />
          ))}
        </div>
      )}

      {data && (
        <Card className="border-border/40 bg-background">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-heading tracking-tight">
                Applications Breakdown
              </h2>
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                grouped by status
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.applicationsByStatus)
                .sort((a, b) => b[1] - a[1])
                .map(([status, value]) => (
                  <div
                    key={status}
                    className="border border-border p-4"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {status.replace(/_/g, " ")}
                    </p>
                    <p className="font-serif text-2xl text-heading mt-1">{value}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/40 bg-background">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-serif text-lg text-heading tracking-tight">Company Trust Index</h2>
          {trustIndicesQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading trust metrics...</p>
          )}
          {(trustIndicesQuery.data ?? []).slice(0, 8).map((row) => (
            <div key={row.companyId} className="border border-border p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-heading">{row.companyName}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                  {row.tier} · {row.companyStatus}
                </p>
              </div>
              <p className="font-serif text-xl text-heading">{row.trustScore}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-background">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-serif text-lg text-heading tracking-tight">Open Company Reports</h2>
          {reportsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading reports...</p>
          )}
          {(reportsQuery.data ?? []).length === 0 && !reportsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">No open reports.</p>
          )}
          {(reportsQuery.data ?? []).map((report) => (
            <div key={report.id} className="border border-border p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {report.severity} · {report.category}
              </p>
              <p className="text-sm text-foreground mt-1">{report.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
