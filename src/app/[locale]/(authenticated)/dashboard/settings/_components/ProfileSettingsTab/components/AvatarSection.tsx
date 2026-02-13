"use client"

import { Camera } from "lucide-react"

interface AvatarSectionProps {
  avatarInitial: string
}

export function AvatarSection({ avatarInitial }: AvatarSectionProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-8">
      <div className="relative group">
        <div className="h-28 w-28 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-4xl font-serif font-bold transition-all group-hover:bg-primary/20">
          {avatarInitial}
        </div>
        <button
          type="button"
          disabled
          className="absolute -bottom-2 -end-2 h-10 w-10 rounded-2xl bg-background border border-border shadow-lg flex items-center justify-center opacity-60 cursor-not-allowed dark:bg-card"
          aria-label="Profile photo upload coming soon"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-sm">Profile Picture</h4>
        <p className="text-xs text-muted-foreground max-w-xs">
          Uploads are coming soon. For now, your avatar is generated from your
          name.
        </p>
      </div>
    </div>
  )
}
