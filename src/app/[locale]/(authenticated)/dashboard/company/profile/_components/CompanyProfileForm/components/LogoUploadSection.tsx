"use client"

import { Building2, Camera, ImagePlus, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ease, reveal } from "@/lib/animations"

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
      className="border border-border/60 bg-card/30 dark:bg-card/50 p-6 sm:p-8"
    >
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Logo display with upload overlay */}
        <div className="relative group shrink-0">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt="Company logo"
              className="h-24 w-24 sm:h-28 sm:w-28 object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="h-24 w-24 sm:h-28 sm:w-28 border-2 border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-2">
              <Building2 className="h-8 w-8 text-muted-foreground/30" />
              <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">
                Logo
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <label className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onUpload}
              disabled={isUploading}
            />
          </label>

          {/* Upload spinner overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload instructions */}
        <div className="space-y-3 min-w-0">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {t("logo")}
            </h3>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              {t("logoHint")}
            </p>
          </div>

          <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] border border-border hover:border-primary/40 hover:text-primary transition-colors cursor-pointer">
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
        </div>
      </div>
    </motion.div>
  )
}
