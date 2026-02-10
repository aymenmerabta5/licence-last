"use client"

import { useEffect, useState } from "react"

import { PlacementDetailClient } from "./_components/PlacementDetailClient"

interface DetailPageProps {
  params: Promise<{ applicationId: string }>
}

export default function PlacementDetailPage({ params }: DetailPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ applicationId: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  return <PlacementDetailClient applicationId={resolvedParams?.applicationId ?? ""} />
}
