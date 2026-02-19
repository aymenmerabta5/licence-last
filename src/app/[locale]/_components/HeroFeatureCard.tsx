"use client"

import type { LucideIcon } from "lucide-react"
import * as motion from "motion/react-client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ease, getRevealVariants, getTransition } from "@/lib/animations"

interface HeroFeatureCardProps {
  num: string
  title: string
  desc: string
  icon: LucideIcon
  index: number
  prefersReducedMotion: boolean
}

export function HeroFeatureCard({
  num,
  title,
  desc,
  icon: Icon,
  index,
  prefersReducedMotion,
}: HeroFeatureCardProps) {
  const revealVariants = getRevealVariants(prefersReducedMotion)

  return (
    <motion.div
      {...revealVariants}
      transition={getTransition(
        { duration: 0.6, ease, delay: 0.4 + index * 0.12 },
        prefersReducedMotion,
      )}
    >
      <Card variant="editorial">
        <CardHeader>
          <span className="font-serif text-4xl font-normal text-primary transition-colors duration-[400ms] group-hover/card:text-secondary-foreground dark:drop-shadow-[0_0_18px_var(--color-primary)] dark:group-hover/card:text-primary-foreground">
            {num}
          </span>
          <CardAction>
            <Icon className="h-5 w-5 opacity-30" />
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="mb-2">{title}</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}
