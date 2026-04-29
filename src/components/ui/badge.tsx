import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-4xl [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground rounded-4xl [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 [a]:hover:bg-destructive/20 rounded-4xl focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline:
          "border-border text-foreground rounded-4xl [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground rounded-4xl dark:hover:bg-muted/50",
        link: "text-primary rounded-4xl underline-offset-4 hover:underline",

        /* ── Editorial variants ─────────────────────────────────── */
        editorial:
          "rounded-none bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] border-none",
        "editorial-outline":
          "rounded-none border-2 border-secondary text-secondary font-bold uppercase tracking-[0.2em] bg-transparent",
        "editorial-muted":
          "rounded-none bg-muted text-muted-foreground font-semibold uppercase tracking-[0.15em] border-none",
        "editorial-accent":
          "rounded-none bg-transparent text-primary font-bold uppercase tracking-[0.2em] border-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ className, variant })),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
