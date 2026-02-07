import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva("group/card flex flex-col text-sm", {
  variants: {
    variant: {
      default:
        "ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
      editorial:
        "border border-border bg-transparent text-card-foreground p-6 transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-secondary hover:text-secondary-foreground hover:border-secondary dark:bg-foreground/[0.02] dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary dark:hover:shadow-[0_4px_30px_oklch(from_var(--color-primary)_l_c_h_/_0.20)] cursor-pointer",
      ghost: "bg-transparent text-card-foreground border-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Card({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        "group-data-[variant=editorial]/card:rounded-none group-data-[variant=editorial]/card:px-0 group-data-[variant=editorial]/card:flex group-data-[variant=editorial]/card:items-start group-data-[variant=editorial]/card:justify-between group-data-[variant=editorial]/card:mb-4",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        "group-data-[variant=editorial]/card:text-lg group-data-[variant=editorial]/card:font-bold group-data-[variant=editorial]/card:tracking-tight",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-muted-foreground text-sm",
        "group-data-[variant=editorial]/card:text-xs group-data-[variant=editorial]/card:leading-relaxed group-data-[variant=editorial]/card:font-light group-data-[variant=editorial]/card:opacity-60 group-data-[variant=editorial]/card:text-current",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-4 group-data-[size=sm]/card:px-3",
        "group-data-[variant=editorial]/card:px-0",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "bg-muted/50 rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3 flex items-center",
        "group-data-[variant=editorial]/card:rounded-none group-data-[variant=editorial]/card:bg-transparent group-data-[variant=editorial]/card:border-t-border",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
