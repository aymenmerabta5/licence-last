"use client"

import { ToolInvocationView } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ToolInvocationView"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type AuthStatus = {
  status: string | null
  url: string | null
}

interface MessageToolInvocationsProps {
  parts: unknown[]
  authByTool: Record<string, AuthStatus>
  onCheckAuth: (toolName: string) => void
  onRegenerateFrom: (messageId: string) => void
  messageId: string
}

export function MessageToolInvocations({
  parts,
  authByTool,
  onCheckAuth,
  onRegenerateFrom,
  messageId,
}: MessageToolInvocationsProps) {
  return (
    <>
      {parts.map((part, idx) => {
        if (
          isRecord(part) &&
          (part.type === "dynamic-tool" ||
            (typeof part.type === "string" &&
              part.type.startsWith("tool-")))
        ) {
          const toolName =
            part.type === "dynamic-tool"
              ? typeof part.toolName === "string"
                ? part.toolName
                : null
              : typeof part.type === "string"
                ? part.type.slice("tool-".length)
                : null

          const authStatus = toolName
            ? (authByTool[toolName] ?? null)
            : null
          const toolCallId =
            isRecord(part) &&
            typeof (part as Record<string, unknown>).toolCallId === "string"
              ? ((part as Record<string, unknown>).toolCallId as string)
              : `tool-${idx}`

          return (
            <ToolInvocationView
              key={toolCallId}
              part={part}
              authStatus={authStatus}
              onCheckAuth={onCheckAuth}
              onRetry={() => onRegenerateFrom(messageId)}
            />
          )
        }
        return null
      })}
    </>
  )
}
