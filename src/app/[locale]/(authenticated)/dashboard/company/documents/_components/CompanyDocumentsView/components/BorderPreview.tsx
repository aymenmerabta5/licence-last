"use client"

import type { BorderStyleKey } from "@/server/pdfs/borders"

interface BorderPreviewProps {
  borderKey: BorderStyleKey
}

export function BorderPreview({ borderKey }: BorderPreviewProps) {
  switch (borderKey) {
    case "classic":
      return (
        <div className="h-8 w-12 shrink-0 border-[3px] border-[#1a1a2e] p-[3px]">
          <div className="h-full w-full border border-[#c9a227]" />
        </div>
      )
    case "minimal":
      return (
        <div className="h-8 w-12 shrink-0 border border-[#e5e5e5]">
          <div className="h-full w-full border-t-4 border-t-[#1a1a2e]" />
        </div>
      )
    case "formal":
      return (
        <div className="h-8 w-12 shrink-0 border-2 border-[#2d2d2d] p-1">
          <div className="h-full w-full border border-[#666666]" />
        </div>
      )
    case "ornate":
      return (
        <div className="relative h-8 w-12 shrink-0 border border-[#c9a227]">
          <div className="absolute -top-px -start-px h-3 w-3 border-s-[3px] border-t-[3px] border-[#c9a227]" />
          <div className="absolute -top-px -end-px h-3 w-3 border-e-[3px] border-t-[3px] border-[#c9a227]" />
          <div className="absolute -bottom-px -start-px h-3 w-3 border-b-[3px] border-s-[3px] border-[#c9a227]" />
          <div className="absolute -bottom-px -end-px h-3 w-3 border-b-[3px] border-e-[3px] border-[#c9a227]" />
        </div>
      )
    case "modern":
      return (
        <div className="h-8 w-12 shrink-0 border border-[#e5e5e5]">
          <div className="h-full w-full border-t border-t-[#e0e0e0] border-s-[6px] border-s-[#1a1a2e]" />
        </div>
      )
    case "premium":
      return (
        <div className="h-8 w-12 shrink-0 border-4 border-[#1a1a2e] bg-[#faf8f5] p-[3px]">
          <div className="h-full w-full border border-[#c9a227]" />
        </div>
      )
    default:
      return (
        <div className="h-8 w-12 shrink-0 border-[3px] border-[#1a1a2e] p-[3px]">
          <div className="h-full w-full border border-[#c9a227]" />
        </div>
      )
  }
}
