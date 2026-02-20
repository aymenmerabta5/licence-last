interface PlacementDetailsProps {
  offerLabel: string
  offerValue: string
  typeLabel: string
  typeValue: string
  startDateLabel: string
  startDateValue: string
  endDateLabel: string
  endDateValue: string
  validatedAtLabel: string
  validatedAtValue: string
}

export function PlacementDetails({
  offerLabel,
  offerValue,
  typeLabel,
  typeValue,
  startDateLabel,
  startDateValue,
  endDateLabel,
  endDateValue,
  validatedAtLabel,
  validatedAtValue,
}: PlacementDetailsProps) {
  return (
    <dl className="grid gap-3 text-sm md:grid-cols-2">
      <div className="space-y-1">
        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {offerLabel}
        </dt>
        <dd className="text-foreground">{offerValue}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {typeLabel}
        </dt>
        <dd className="text-foreground">{typeValue}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {startDateLabel}
        </dt>
        <dd className="text-foreground">{startDateValue}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {endDateLabel}
        </dt>
        <dd className="text-foreground">{endDateValue}</dd>
      </div>
      <div className="space-y-1 md:col-span-2">
        <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
          {validatedAtLabel}
        </dt>
        <dd className="text-foreground">{validatedAtValue}</dd>
      </div>
    </dl>
  )
}
