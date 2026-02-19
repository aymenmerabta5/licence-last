"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function ProfileSettingsTabSkeleton() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-border/40 bg-background rounded-3xl overflow-hidden shadow-sm">
        <CardHeader className="bg-gradient-to-b from-secondary/15 to-transparent px-8 py-10 border-b border-border/15">
          <CardTitle className="font-serif text-2xl">
            Profile Identity
          </CardTitle>
          <CardDescription className="font-medium">
            Loading your settings...
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-24 w-24 rounded-2xl bg-secondary/20 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-secondary/20 rounded animate-pulse" />
              <div className="h-3 w-48 bg-secondary/15 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-secondary/15 rounded-xl animate-pulse" />
            <div className="h-12 bg-secondary/15 rounded-xl animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
