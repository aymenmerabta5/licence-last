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
    <div className="flex flex-col sm:flex-row sm:items-center gap-8 p-6 sm:p-10 rounded-[2rem] bg-secondary/[0.02] border border-border/20 shadow-inner">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onUpload}
        className="hidden"
        aria-label="Upload profile photo"
      />

      <div className="relative group shrink-0">
        {/* Editorial glow effect */}
        <div className="absolute -inset-8 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,transparent_70%)] opacity-0 group-hover:opacity-[0.08] blur-2xl transition-opacity duration-[1500ms]" />

        <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-[2rem] sm:rounded-[2.5rem] bg-background flex items-center justify-center text-primary text-5xl sm:text-6xl font-serif font-bold overflow-hidden shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-border/30 transition-all duration-700 ease-out group-hover:ring-primary/40 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] -rotate-2 group-hover:rotate-0 scale-95 group-hover:scale-100 dark:shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Profile"
              fill
              className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
              sizes="(max-width: 640px) 128px, 160px"
            />
          ) : (
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary/80 to-primary/40">
              {avatarInitial}
            </span>
          )}

          {/* Hover overlay */}
          <button
            type="button"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-background/0 group-hover:bg-background/40 backdrop-blur-[0px] group-hover:backdrop-blur-sm transition-all duration-500 cursor-pointer disabled:cursor-not-allowed"
            aria-label="Upload profile photo"
          >
            <Camera className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100 drop-shadow-lg" />
          </button>
        </div>

        {/* Upload spinner indicator */}
        {isBusy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[2rem] sm:rounded-[2.5rem] bg-background/80 backdrop-blur-md z-10">
            <Loader2 className="h-8 w-8 animate-[spin_3s_linear_infinite] text-primary" />
          </div>
        )}
      </div>

      <div className="space-y-4 flex flex-col items-start border-s-0 sm:border-s-2 border-border/20 sm:ps-8">
        <div>
          <h4 className="font-serif text-2xl tracking-tight text-heading">
            Identity Visual
          </h4>
          <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs leading-relaxed font-medium">
            We recommend a professional headshot. <br />
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-60 mt-2 block">
              JPG/PNG/WEBP &middot; 5MB MAX
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          <Button
            type="button"
            variant="default"
            size="editorial-sm"
            className="h-10 px-6 text-xs gap-2 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            disabled={isBusy}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </Button>
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            className="h-10 px-5 text-xs gap-2 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
            disabled={isBusy || !imageUrl}
            onClick={() => {
              void onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
