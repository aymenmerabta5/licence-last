"use client"

import * as motion from "motion/react-client"

import { reveal, ease } from "@/lib/animations"

import type { TrustData } from "../types"

interface TrustBannerProps {
  data: TrustData
}

export function TrustBanner({ data }: TrustBannerProps) {
  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.45, ease, delay: 0.05 }}
      className="border border-border p-4 flex flex-wrap items-center gap-4"
    >
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Company Trust Index
      </p>
      <p className="font-serif text-2xl text-heading">
        {data.trustScore}
        <span className="text-sm text-muted-foreground">/100</span>
      </p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        Tier: {data.tier}
      </p>
      <p className="text-xs text-muted-foreground">
        Response {data.factors.responseRate}% · Completion{" "}
        {data.factors.completionRate}%
      </p>
    </motion.div>
  )
}
