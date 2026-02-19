import { Button, Heading, Section, Text } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

export default function VerifyEmailEmail({ link }: { link: string }) {
  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Internex
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Verify your email
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Thanks for signing up! Please verify your email address by clicking
            the button below.
          </Text>
          <Button
            className="bg-primary rounded-lg px-6 py-3 font-semibold text-white"
            href={link}
          >
            Verify Email
          </Button>
          <Text className="text-mutedForeground mt-6 text-sm">
            If you didn&apos;t create an account, you can safely ignore this
            email.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  )
}
