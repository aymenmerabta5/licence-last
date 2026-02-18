import { ShieldAlert } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeatureDisabledCardProps {
  message?: string
}

export function FeatureDisabledCard({
  message = "Interviews are currently disabled by platform settings.",
}: FeatureDisabledCardProps) {
  return (
    <Card className="border-dashed border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          Interviews unavailable
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Please contact your administrator to re-enable this feature.
        </p>
      </CardContent>
    </Card>
  )
}
