"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "@/i18n/routing"

export function VerifyForm() {
  const t = useTranslations("verify")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    setIsSubmitting(true)
    router.push(`/verify/${encodeURIComponent(trimmed)}` as never)
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t("placeholder")}
              className="font-mono text-lg tracking-wider text-center uppercase"
              maxLength={20}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!code.trim() || isSubmitting}
              className="shrink-0"
            >
              <ShieldCheck className="size-4 me-2" />
              {isSubmitting ? t("checking") : t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
