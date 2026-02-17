import { Section, Text, Heading } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

interface CompanyRejectedEmailProps {
  companyName: string
  reason: string
  supportEmail?: string
}

export default function CompanyRejectedEmail({
  companyName,
  reason,
  supportEmail = "support@internex.io",
}: CompanyRejectedEmailProps) {
  return (
    <EmailLayout title="Company Application Update — Internex">
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
          Internex
        </Heading>
        <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
          Application not approved
        </Heading>
        <Text className="text-mutedForeground mb-2 text-base">
          Unfortunately, the application for <strong>{companyName}</strong> was
          not approved at this time.
        </Text>
        <Section className="bg-background my-4 rounded-md border border-border px-4 py-3 text-left">
          <Text className="text-mutedForeground mb-1 text-xs font-semibold uppercase tracking-wider">
            Reason
          </Text>
          <Text className="text-foreground text-sm">{reason}</Text>
        </Section>
        <Text className="text-mutedForeground mt-6 text-sm">
          If you believe this is an error or would like to provide additional
          information, please contact us at{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="text-primary underline"
          >
            {supportEmail}
          </a>
          .
        </Text>
      </Section>
    </EmailLayout>
  )
}
