"use client"

import { Camera, ImagePlus, Loader2, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface AvatarSectionProps {
  avatarInitial: string
  imageUrl: string | null
  isUploading: boolean
  isDeleting: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelete: () => Promise<void>
}

export function AvatarSection({
  avatarInitial,
  imageUrl,
  isUploading,
  isDeleting,
  inputRef,
  onUpload,
  onDelete,
}: AvatarSectionProps) {
  const isBusy = isUploading || isDeleting

  return (
    <div className="border border-border/60 bg-card/30 dark:bg-card/50 p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUpload}
        className="hidden"
        aria-label="Upload profile photo"
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="h-28 w-28 sm:h-32 sm:w-32 border-2 border-primary/20 bg-background flex items-center justify-center text-primary text-4xl sm:text-5xl font-serif overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 112px, 128px"
              />
            ) : (
              avatarInitial
            )}

            {/* Hover overlay */}
            <button
              type="button"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Upload profile photo"
            >
              <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {isBusy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Upload instructions */}
        <div className="space-y-3 min-w-0">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Identity Visual
            </h3>
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              We recommend a professional headshot.
            </p>
            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/40">
              JPG/PNG/WEBP &middot; 5MB MAX
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="editorial"
              size="editorial-sm"
              disabled={isBusy}
              onClick={() => inputRef.current?.click()}
              className="gap-1.5"
            >
              <ImagePlus className="h-3.5 w-3.5" />
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="editorial-outline"
              size="editorial-sm"
              disabled={isBusy || !imageUrl}
              onClick={() => {
                void onDelete()
              }}
              className="gap-1.5 text-destructive hover:text-destructive hover:border-destructive/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
