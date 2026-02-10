"use client"

import { useEffect, useState } from "react"

import { CandidatesClient } from "./_components/CandidatesClient"

interface CandidatePageProps {
  params: Promise<{ offerId: string }>
}

export default function CandidatesPage({ params }: CandidatePageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ offerId: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  return <CandidatesClient offerId={resolvedParams?.offerId ?? ""} />
}
