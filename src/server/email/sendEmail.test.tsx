import { beforeEach, describe, expect, mock, test } from "bun:test"

function TestEmail() {
  return <div>Hello</div>
}

const loggerWarnMock = mock(() => {})
const loggerInfoMock = mock(() => {})
const loggerErrorMock = mock(() => {})

const sendMock = mock(async () => ({ data: { id: "msg-1" }, error: null }))
const ResendMock = mock(() => ({
  emails: {
    send: sendMock,
  },
}))

function applyLocalMocks() {
  mock.module("resend", () => ({
    Resend: ResendMock,
  }))

  mock.module("@/server/logging", () => ({
    logger: {
      warn: loggerWarnMock,
      info: loggerInfoMock,
      error: loggerErrorMock,
      trace: () => {},
      debug: () => {},
      fatal: () => {},
      child: () => ({
        warn: loggerWarnMock,
        info: loggerInfoMock,
        error: loggerErrorMock,
        trace: () => {},
        debug: () => {},
        fatal: () => {},
        child: () => ({}),
      }),
    },
    createLogger: () => ({
      warn: loggerWarnMock,
      info: loggerInfoMock,
      error: loggerErrorMock,
      trace: () => {},
      debug: () => {},
      fatal: () => {},
      child: () => ({}),
    }),
    createModuleLogger: () => ({
      warn: loggerWarnMock,
      info: loggerInfoMock,
      error: loggerErrorMock,
      trace: () => {},
      debug: () => {},
      fatal: () => {},
      child: () => ({}),
    }),
  }))
}

describe("src/server/email/sendEmail", () => {
  beforeEach(() => {
    applyLocalMocks()
    loggerWarnMock.mockClear()
    loggerInfoMock.mockClear()
    loggerErrorMock.mockClear()
    sendMock.mockClear()
    ResendMock.mockClear()
  })

  test("returns graceful response when RESEND_API_KEY is missing", async () => {
    mock.module("@/env", () => ({
      env: {
        RESEND_API_KEY: undefined,
        EMAIL_FROM: "no-reply@stag.io",
      },
    }))

    const { sendEmail } = await import("@/server/email/sendEmail?noKey=1")

    const result = await sendEmail("qa@example.com", "Subject", TestEmail, {})

    expect(result).toEqual({
      success: false,
      error: "Email not configured",
    })
    expect(loggerWarnMock).toHaveBeenCalledTimes(1)
    expect(ResendMock).not.toHaveBeenCalled()
  })

  test("sends email when configuration is available", async () => {
    mock.module("@/env", () => ({
      env: {
        RESEND_API_KEY: "re_test_123",
        EMAIL_FROM: "no-reply@stag.io",
      },
    }))

    const { sendEmail } = await import("@/server/email/sendEmail?withKey=1")

    const result = await sendEmail("qa@example.com", "Subject", TestEmail, {})

    expect(result).toEqual({
      success: true,
      code: "EMAIL_SENT",
      message: "Email sent successfully.",
    })
    expect(ResendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(loggerInfoMock).toHaveBeenCalledTimes(1)
  })
})
