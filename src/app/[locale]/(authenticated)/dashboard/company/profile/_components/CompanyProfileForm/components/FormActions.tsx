"use client"

import { Loader2, Save } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { CompanyProfileFormApi } from "@/app/[locale]/(authenticated)/dashboard/company/profile/_components/CompanyProfileForm/hooks/useCompanyProfileForm"
import { Button } from "@/components/ui/button"
import { ease } from "@/lib/animations"

interface FormActionsProps {
  form: CompanyProfileFormApi
}

export function FormActions({ form }: FormActionsProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: 0.4 }}
    >
      <form.Subscribe
        selector={(state) => [state.isSubmitting] as const}
      >
        {([isSubmitting]) => (
          <Button
            type="submit"
            variant="editorial"
            size="editorial"
            className="w-full h-11 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("submit")}
              </>
            )}
          </Button>
        )}
      </form.Subscribe>
    </motion.div>
  )
}
