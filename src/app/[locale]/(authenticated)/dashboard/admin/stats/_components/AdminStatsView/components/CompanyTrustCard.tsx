import { Card, CardContent } from "@/components/ui/card"

interface TrustRow {
  companyId: string
  companyName: string
  trustScore: number
  tier: string
  companyStatus: string
}

interface CompanyTrustCardProps {
  trustIndices: TrustRow[]
  isLoading: boolean
}

export function CompanyTrustCard({
  trustIndices,
  isLoading,
}: CompanyTrustCardProps) {
  return (
    <Card className="border-border/40 bg-background">
      <CardContent className="p-6 space-y-4">
        <h2 className="font-serif text-lg text-heading tracking-tight">
          Company Trust Index
        </h2>
        {isLoading && (
          <p className="text-sm text-muted-foreground">
            Loading trust metrics...
          </p>
        )}
        {trustIndices.slice(0, 8).map((row) => (
          <div
            key={row.companyId}
            className="border border-border p-3 flex items-center justify-between gap-3"
          >
            <div>
              <p className="text-sm font-medium text-heading">
                {row.companyName}
              </p>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                {row.tier} · {row.companyStatus}
              </p>
            </div>
            <p className="font-serif text-xl text-heading">
              {row.trustScore}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
