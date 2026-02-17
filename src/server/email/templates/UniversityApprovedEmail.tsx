import { Button, Section, Text, Heading } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

interface UniversityApprovedEmailProps {
  universityName: string
  dashboardUrl: string
}

export default function UniversityApprovedEmail({
  universityName,
  dashboardUrl,
}: UniversityApprovedEmailProps) {
  return (
    <EmailLayout title="University Approved — Internex">
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
          Internex
        </Heading>
        <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
          Your university has been approved
        </Heading>
        <Text className="text-mutedForeground mb-2 text-base">
          Great news! <strong>{universityName}</strong> has been reviewed and
          approved by our team.
        </Text>
        <Text className="text-mutedForeground mb-6 text-base">
          You now have full access to the admin dashboard where you can manage
          departments, validate placements, and more.
        </Text>
        <Button
          className="bg-primary rounded-lg px-6 py-3 font-semibold text-white"
          href={dashboardUrl}
        >
          Go to Dashboard
        </Button>
      </Section>
    </EmailLayout>
  )
}
