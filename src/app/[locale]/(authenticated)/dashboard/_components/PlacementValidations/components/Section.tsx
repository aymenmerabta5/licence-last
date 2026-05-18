import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  titleIcon?: React.ReactNode
}

export function Section({
  children,
  className,
  title,
  titleIcon,
}: SectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center gap-2">
          {titleIcon && (
            <span className="text-muted-foreground/70">{titleIcon}</span>
          )}
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  )
}
