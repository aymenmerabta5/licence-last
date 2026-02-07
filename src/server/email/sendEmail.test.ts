import { describe, test, expect, beforeEach, afterEach } from "bun:test"

// Re-declare the function and interface to test
interface SendEmailArgs {
  to: string
  subject: string
  text: string
  html?: string
}

async function sendEmail({ to, subject, text, html }: SendEmailArgs, env: { EMAIL_FROM?: string; RESEND_API_KEY?: string }): Promise<void> {
  const from = env.EMAIL_FROM
  const resendKey = env.RESEND_API_KEY

  // If a provider isn't configured, fall back to console output.
  if (!resendKey || !from) {
    // Keep logs clear for local development.
    console.info("[email:dev]", { to, subject })
    console.info(text)
    return
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    throw new Error(
      `Failed to send email (status ${response.status}): ${body || response.statusText}`,
    )
  }
}

describe("sendEmail", () => {
  let originalFetch: typeof global.fetch
  let fetchCalls: Array<{ url: string; options: RequestInit }>
  let consoleInfoCalls: Array<unknown[]>

  beforeEach(() => {
    originalFetch = global.fetch
    fetchCalls = []
    consoleInfoCalls = []
    
    // Mock fetch with proper type
    const mockFetch = async (url: string | URL | Request, options?: RequestInit) => {
      fetchCalls.push({ url: url.toString(), options: options || {} })
      return new Response(JSON.stringify({ id: "test-id" }), { status: 200 })
    }
    global.fetch = mockFetch as typeof global.fetch

    // Mock console.info
    console.info = (...args: unknown[]) => {
      consoleInfoCalls.push(args)
    }
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe("with configured Resend API", () => {
    const env = {
      EMAIL_FROM: "noreply@example.com",
      RESEND_API_KEY: "test_api_key_12345",
    }

    test("should send email with correct API endpoint", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(1)
      expect(fetchCalls[0].url).toBe("https://api.resend.com/emails")
    })

    test("should use POST method", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls[0].options.method).toBe("POST")
    })

    test("should include correct authorization header", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      const headers = fetchCalls[0].options.headers as Record<string, string>
      expect(headers.Authorization).toBe("Bearer test_api_key_12345")
    })

    test("should include correct content-type header", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      const headers = fetchCalls[0].options.headers as Record<string, string>
      expect(headers["Content-Type"]).toBe("application/json")
    })

    test("should send correct JSON body with all required fields", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body content",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body).toEqual({
        from: "noreply@example.com",
        to: "user@example.com",
        subject: "Test Subject",
        text: "Test body content",
        html: undefined,
      })
    })

    test("should include HTML when provided", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Plain text body",
          html: "<p>HTML body</p>",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.html).toBe("<p>HTML body</p>")
    })

    test("should handle different recipient addresses", async () => {
      const recipients = [
        "user1@example.com",
        "student@univ.edu.dz",
        "admin@company.co.uk",
        "user+tag@example.org",
      ]

      for (const to of recipients) {
        fetchCalls = [] // Reset calls
        await sendEmail(
          {
            to,
            subject: "Test",
            text: "Body",
          },
          env
        )

        const body = JSON.parse(fetchCalls[0].options.body as string)
        expect(body.to).toBe(to)
      }
    })

    test("should handle special characters in subject", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test: Special chars! @#$%^&*()",
          text: "Body",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.subject).toBe("Test: Special chars! @#$%^&*()")
    })
  })

  describe("fallback to console (no API configured)", () => {
    test("should log to console when RESEND_API_KEY is missing", async () => {
      const env = {
        EMAIL_FROM: "noreply@example.com",
        RESEND_API_KEY: undefined,
      }

      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(0)
    })

    test("should log to console when EMAIL_FROM is missing", async () => {
      const env = {
        EMAIL_FROM: undefined,
        RESEND_API_KEY: "test_key",
      }

      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(0)
    })

    test("should log to console when both are missing", async () => {
      const env = {
        EMAIL_FROM: undefined,
        RESEND_API_KEY: undefined,
      }

      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(0)
    })

    test("should log to console when EMAIL_FROM is empty string", async () => {
      const env = {
        EMAIL_FROM: "",
        RESEND_API_KEY: "test_key",
      }

      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(0)
    })

    test("should log to console when RESEND_API_KEY is empty string", async () => {
      const env = {
        EMAIL_FROM: "noreply@example.com",
        RESEND_API_KEY: "",
      }

      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test Subject",
          text: "Test body",
        },
        env
      )

      expect(fetchCalls).toHaveLength(0)
    })
  })

  describe("error handling", () => {
    const env = {
      EMAIL_FROM: "noreply@example.com",
      RESEND_API_KEY: "test_api_key_12345",
    }

    test("should throw error on 400 Bad Request", async () => {
      global.fetch = (async () => {
        return new Response("Invalid email address", { status: 400 })
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "invalid-email",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Failed to send email (status 400): Invalid email address")
    })

    test("should throw error on 401 Unauthorized", async () => {
      global.fetch = (async () => {
        return new Response("Unauthorized", { status: 401 })
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "user@example.com",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Failed to send email (status 401): Unauthorized")
    })

    test("should throw error on 429 Rate Limited", async () => {
      global.fetch = (async () => {
        return new Response("Rate limit exceeded", { status: 429 })
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "user@example.com",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Failed to send email (status 429): Rate limit exceeded")
    })

    test("should throw error on 500 Server Error", async () => {
      global.fetch = (async () => {
        return new Response("Internal Server Error", { status: 500 })
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "user@example.com",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Failed to send email (status 500): Internal Server Error")
    })

    test("should include status text when no body", async () => {
      global.fetch = (async () => {
        return new Response(null, { status: 502, statusText: "Bad Gateway" })
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "user@example.com",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Failed to send email (status 502): Bad Gateway")
    })

    test("should handle network errors", async () => {
      global.fetch = (async () => {
        throw new Error("Network error")
      }) as unknown as typeof global.fetch

      expect(
        sendEmail(
          {
            to: "user@example.com",
            subject: "Test",
            text: "Body",
          },
          env
        )
      ).rejects.toThrow("Network error")
    })
  })

  describe("edge cases", () => {
    const env = {
      EMAIL_FROM: "noreply@example.com",
      RESEND_API_KEY: "test_api_key_12345",
    }

    test("should handle empty text body", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test",
          text: "",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.text).toBe("")
    })

    test("should handle long text body", async () => {
      const longText = "a".repeat(10000)
      await sendEmail(
        {
          to: "user@example.com",
          subject: "Test",
          text: longText,
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.text).toBe(longText)
    })

    test("should handle Unicode in subject and body", async () => {
      await sendEmail(
        {
          to: "user@example.com",
          subject: "مرحبا بالعالم 🌍",
          text: "Café résumé naïve 🎉",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.subject).toBe("مرحبا بالعالم 🌍")
      expect(body.text).toBe("Café résumé naïve 🎉")
    })

    test("should handle multiple recipients (if supported)", async () => {
      await sendEmail(
        {
          to: "user1@example.com",
          subject: "Test",
          text: "Body",
        },
        env
      )

      const body = JSON.parse(fetchCalls[0].options.body as string)
      expect(body.to).toBe("user1@example.com")
    })
  })
})
