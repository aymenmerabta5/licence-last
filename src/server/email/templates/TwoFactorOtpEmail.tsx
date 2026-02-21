import { Heading, Section, Text } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

export default function TwoFactorOtpEmail({
  otp,
  userName,
}: {
  otp: string
  userName: string
}) {
  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Stag
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Verification Code
          </Heading>
          <Text className="text-mutedForeground mb-2 text-base">
            Hi {userName}, here is your two-factor authentication code:
          </Text>
          <Text
            style={{
              fontSize: "32px",
              fontFamily: "monospace",
              letterSpacing: "0.3em",
              fontWeight: 700,
              padding: "16px 24px",
              margin: "16px auto",
            }}
            className="text-foreground"
          >
            {otp}
          </Text>
          <Text className="text-mutedForeground mt-4 text-sm">
            This code expires in 5 minutes. If you didn&apos;t request this, you
            can safely ignore this email.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  )
}
