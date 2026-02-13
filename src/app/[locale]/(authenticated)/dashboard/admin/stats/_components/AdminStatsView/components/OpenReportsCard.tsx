import { Card, CardContent } from "@/components/ui/card"

interface Report {
  id: string
  severity: string
  category: string
  description: string
}

interface OpenReportsCardProps {
  reports: Report[]
  isLoading: boolean
}

export function OpenReportsCard({ reports, isLoading }: OpenReportsCardProps) {
  return (
    <Card className="border-border/40 bg-background">
      <CardContent className="p-6 space-y-4">
        <h2 className="font-serif text-lg text-heading tracking-tight">
          Open Company Reports
        </h2>
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        )}
        {reports.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">No open reports.</p>
        )}
        {reports.map((report) => (
          <div key={report.id} className="border border-border p-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {report.severity} · {report.category}
            </p>
            <p className="text-sm text-foreground mt-1">
              {report.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
