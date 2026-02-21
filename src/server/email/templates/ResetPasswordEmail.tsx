/*
 *   Copyright (c) 2025 Aimen Merabta
 *   All rights reserved.
 *   Strict Notice: Unauthorized copying, use, or distribution of this code is strictly prohibited. Violators may be prosecuted and reported to law enforcement.
 */
import { Button, Heading, Section, Text } from "@react-email/components"
import EmailLayout from "@/server/email/templates/EmailLayout"

export default function ResetPasswordEmail({ link }: { link: string }) {
  return (
    <EmailLayout>
      <Section className="bg-card my-6 rounded-lg px-6 py-12 text-center">
        <Section className="text-center">
          <Heading as="h1" className="text-primary mb-2 text-2xl font-bold">
            Stag
          </Heading>
          <Heading as="h2" className="text-foreground mb-4 text-3xl font-bold">
            Reset your password
          </Heading>
          <Text className="text-mutedForeground mb-6 text-base">
            Hey there! We received a request to reset your password. If you
            didn&apos;t make this request, you can safely ignore this email.
          </Text>
          <Button
            className="bg-primary rounded-lg px-6 py-3 font-semibold text-white"
            href={link}
          >
            Reset Password
          </Button>
          <Text className="text-mutedForeground mt-6 text-sm">
            This link will expire in 1 hour for security reasons.
          </Text>
        </Section>
      </Section>
    </EmailLayout>
  )
}
