import { VerificationResult } from "@/app/[locale]/verify/[code]/_components/VerificationResult"
import { orpcClient } from "@/server/orpc/client"

interface VerificationResultPageContentProps {
  code: string
}

export async function VerificationResultPageContent({
  code,
}: VerificationResultPageContentProps) {
  const result = await orpcClient.documents.verify({ code })

  return <VerificationResult result={result} code={code} />
}
