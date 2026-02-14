"use client"

import Image from "next/image"
import { Camera, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AvatarSectionProps {
  avatarInitial: string
  imageUrl: string | null
  isUploading: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AvatarSection({
  avatarInitial,
  imageUrl,
  isUploading,
  inputRef,
  onUpload,
}: AvatarSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUpload}
        className="hidden"
        aria-label="Upload profile photo"
      />

      <div className="relative group">
        {/* Avatar ring */}
        <div className="absolute -inset-1 rounded-[1.25rem] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative h-24 w-24 rounded-2xl bg-primary/8 flex items-center justify-center text-primary text-3xl font-serif font-bold overflow-hidden ring-2 ring-border/20 ring-offset-2 ring-offset-background transition-all">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Profile"
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            avatarInitial
          )}

          {/* Hover overlay */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload profile photo"
          >
            <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Upload spinner indicator */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        <div>
          <h4 className="font-bold text-sm">Profile Picture</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            JPEG, PNG or WebP &middot; Max 2 MB
          </p>
        </div>
        <Button
          type="button"
          variant="editorial-outline"
          size="editorial-sm"
          className="h-8 px-3 text-xs gap-1.5 rounded-lg"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Upload Photo
        </Button>
      </div>
    </div>
  )
}
