"use client"

import { Briefcase, ArrowRight, Search } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

import type { ApplicationRow } from "../types"
import { ApplicationCard } from "./ApplicationCard"

interface ApplicationsFeedProps {
  applications: ApplicationRow[]
  labels: {
    title: string
    viewAll: string
    emptyMessage: string
    exploreButton: string
  }
}

export function ApplicationsFeed({ applications, labels }: ApplicationsFeedProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-heading">
          {labels.title}
        </h2>
        <Link href="/dashboard/applications">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/80 group text-xs font-bold uppercase tracking-widest"
          >
            {labels.viewAll}{" "}
            <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <Card className="border-border/40 bg-background shadow-sm">
          <CardContent className="p-10 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-secondary/10">
              <Briefcase className="h-6 w-6 text-muted-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground/60 font-medium max-w-xs mx-auto leading-relaxed">
              {labels.emptyMessage}
            </p>
            <Link href="/dashboard/explore">
              <Button
                variant="editorial"
                size="editorial-sm"
                className="rounded-xl border-primary bg-primary text-white hover:bg-primary/90"
              >
                <Search className="h-4 w-4 me-2" /> {labels.exploreButton}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
