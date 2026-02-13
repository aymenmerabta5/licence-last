"use client"

import { Camera, Loader2, X } from "lucide-react"

interface AvatarSectionProps {
  avatarInitial: string
  imageUrl: string | null
  isUploading: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function AvatarSection({
  avatarInitial,
  imageUrl,
  isUploading,
  inputRef,
  onUpload,
  onRemove,
}: AvatarSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUpload}
        className="hidden"
        aria-label="Upload profile photo"
      />

      <div className="relative group">
        <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-serif font-bold transition-all group-hover:bg-primary/20 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            avatarInitial
          )}
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-2 -end-2 h-10 w-10 rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform dark:bg-card disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Upload profile photo"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-sm">Profile Picture</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          JPEG, PNG or WebP. Max 2 MB.
        </p>
        {imageUrl && (
          <button
            type="button"
            disabled={isUploading}
            onClick={onRemove}
            className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-60"
          >
            <X className="h-3 w-3" />
            Remove photo
          </button>
        )}
      </div>
    </div>
  )
}
