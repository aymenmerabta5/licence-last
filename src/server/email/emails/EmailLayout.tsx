/*
 *   Copyright (c) 2025 Aimen Merabta
 *   All rights reserved.
 *   Strict Notice: Unauthorized copying, use, or distribution of this code is strictly prohibited. Violators may be prosecuted and reported to law enforcement.
 */
import { Html, Head, Body, Container } from "@react-email/components";
import { Tailwind, pixelBasedPreset } from "@react-email/tailwind";
import type { TailwindConfig } from "@react-email/tailwind";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  title?: string;
}

const tailwindConfig: TailwindConfig = {
  presets: [pixelBasedPreset],
  theme: {
    extend: {
      colors: {
        // Email-safe hex colors (converted from oklch for email client compatibility)
        background: "#f9f6f1",
        foreground: "#0a0a0a",
        card: "#f9f6f1",
        cardForeground: "#0a0a0a",
        primary: "#d33d00",
        primaryForeground: "#f9f6f1",
        secondary: "#0a0a0a",
        secondaryForeground: "#f9f6f1",
        muted: "#efebe2",
        mutedForeground: "#6a6560",
        accent: "#efebe2",
        accentForeground: "#0a0a0a",
        destructive: "#e7000f",
        border: "#e1deda",
      },
    },
  },
};

export default function EmailLayout({
  children,
  title = "Internex",
}: EmailLayoutProps) {
  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Tailwind config={tailwindConfig}>
        <Body className="bg-background text-foreground">
          <Container className="mx-auto max-w-2xl px-6 py-10">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export { tailwindConfig };
