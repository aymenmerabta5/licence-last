import { BarChart3 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface ApplicationsBreakdownCardProps {
  applicationsByStatus: Record<string, number>
}

export function ApplicationsBreakdownCard({
  applicationsByStatus,
}: ApplicationsBreakdownCardProps) {
  return (
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
          {Object.entries(applicationsByStatus)
            .sort((a, b) => b[1] - a[1])
            .map(([status, value]) => (
              <div key={status} className="border border-border p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {status.replace(/_/g, " ")}
                </p>
                <p className="font-serif text-2xl text-heading mt-1">
                  {value}
                </p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
