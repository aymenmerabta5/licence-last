import { Camera, ImagePlus, Loader2 } from "lucide-react"
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
      className="space-y-4"
    >
      {/* Section divider */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border/30" />
        <div className="flex items-center gap-1.5 shrink-0">
          <Camera className="h-3 w-3 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50 [[dir=rtl]_&]:tracking-normal">
            {t("logo")}
          </span>
        </div>
        <div className="h-px flex-1 bg-border/30" />
      </div>

      <div className="flex items-center gap-6">
        {/* Logo preview — larger */}
        <div className="relative group">
          {logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={logoUrl}
              alt="Company logo"
              className="h-24 w-24 rounded-xl object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border/60 bg-secondary/30 flex flex-col items-center justify-center gap-1.5">
              <ImagePlus className="h-6 w-6 text-muted-foreground/30" />
              <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/30">
                Logo
              </span>
            </div>
          )}
          {/* Hover overlay */}
          <label className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
            <Camera className="h-5 w-5 text-white" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onUpload}
              disabled={isUploading}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider border-2 border-border hover:border-primary/40 hover:text-primary transition-all cursor-pointer">
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
          <p className="text-[10px] text-muted-foreground/50 font-medium">
            {t("logoHint")}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
