import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ImagePlus, Loader2 } from "lucide-react"

import { Label } from "@/components/ui/label"
import { reveal, ease } from "@/lib/animations"

interface LogoUploadSectionProps {
  logoUrl: string
  isUploading: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function LogoUploadSection({
  logoUrl,
  isUploading,
  onUpload,
}: LogoUploadSectionProps) {
  const t = useTranslations("dashboard.company.profile")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="space-y-3"
    >
      <Label className="text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
        {t("logo")}
      </Label>
      <div className="flex items-center gap-4">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt="Company logo"
            className="h-16 w-16 rounded-lg object-cover border border-border"
          />
        ) : (
          <div className="h-16 w-16 rounded-lg border border-dashed border-border flex items-center justify-center">
            <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border hover:border-primary/30 hover:text-primary transition-colors cursor-pointer">
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t("logoUploading")}
              </>
            ) : (
              <>
                <ImagePlus className="h-3.5 w-3.5" />
                {t("logoUpload")}
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onUpload}
              disabled={isUploading}
            />
          </label>
          <p className="text-[10px] text-muted-foreground mt-1">{t("logoHint")}</p>
        </div>
      </div>
    </motion.div>
  )
}
