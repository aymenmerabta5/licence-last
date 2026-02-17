import { Button, Section, Text, Heading } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

interface DeptHeadWelcomeEmailProps {
  name: string
  departmentName: string
  universityName: string
  link: string
}

export default function DeptHeadWelcomeEmail({
  name,
  departmentName,
  universityName,
  link,
}: DeptHeadWelcomeEmailProps) {
  return (
    <EmailLayout title="Welcome to Internex">
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Internex
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Welcome, {name}!
          </Heading>
          <Text className="text-mutedForeground mb-2 text-base">
            You&apos;ve been added as <strong>Department Head</strong> for{" "}
            <strong>{departmentName}</strong> at <strong>{universityName}</strong>.
          </Text>
          <Text className="text-mutedForeground mb-6 text-base">
            Click the button below to set your password and get started.
          </Text>
          <Button
            className="bg-primary rounded-lg px-6 py-3 font-semibold text-white"
            href={link}
          >
            Set Your Password
          </Button>
          <Text className="text-mutedForeground mt-6 text-sm">
            This link will expire in 1 hour for security reasons.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  )
}
