import { ShieldAlert } from "lucide-react"
import { useTranslations } from "next-intl"

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

export function FeatureDisabledCard({ message }: FeatureDisabledCardProps) {
  const t = useTranslations("dashboard.interviews")

  return (
    <Card className="border-dashed border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          {t("disabled.title")}
        </CardTitle>
        <CardDescription>
          {message ?? t("disabled.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t("disabled.help")}</p>
      </CardContent>
    </Card>
  )
}
