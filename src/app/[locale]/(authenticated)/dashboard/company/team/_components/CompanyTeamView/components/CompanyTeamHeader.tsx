"use client"

export function CompanyTeamHeader() {
  return (
    <header className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        Company Workspace
      </p>
      <h1 className="font-serif text-3xl tracking-tight text-heading">
        Team Members
      </h1>
      <p className="text-sm text-muted-foreground">
        Owners manage team access. Recruiters can work on offers and candidates.
      </p>
    </header>
  )
}
